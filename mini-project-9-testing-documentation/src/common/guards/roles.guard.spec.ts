import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard.js';
import { UsersService } from '../../users/users.service.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

describe('RolesGuard', () => {
  const userId = '507f1f77bcf86cd799439011';

  const reflector = {
    getAllAndOverride: vi.fn(),
  } as unknown as Reflector;

  const usersService = {
    findById: vi.fn(),
  } as unknown as UsersService;

  const guard = new RolesGuard(reflector, usersService);

  function createContext(sub?: string) {
    const request = {
      user: sub ? { sub } : undefined,
    };

    return {
      getHandler: () => vi.fn(),
      getClass: () => vi.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow a route without required roles', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);

    const result = await guard.canActivate(createContext(userId));

    expect(result).toBe(true);
  });

  it('should reject a request without user information', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['admin']);

    await expect(guard.canActivate(createContext())).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should reject a user who does not have the required role', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['admin']);

    vi.mocked(usersService.findById).mockResolvedValue({
      role: 'user',
    } as never);

    await expect(guard.canActivate(createContext(userId))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow an admin user', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['admin']);

    vi.mocked(usersService.findById).mockResolvedValue({
      role: 'admin',
    } as never);

    const result = await guard.canActivate(createContext(userId));

    expect(result).toBe(true);
    expect(usersService.findById).toHaveBeenCalledWith(userId);
  });

  it('should reject a user that no longer exists', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['admin']);

    vi.mocked(usersService.findById).mockResolvedValue(null);

    await expect(guard.canActivate(createContext(userId))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
