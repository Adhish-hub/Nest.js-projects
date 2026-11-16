import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import { CsrfGuard } from './csrf.guard.js';
import { CsrfService } from './csrf.service.js';

describe('CsrfGuard', () => {
  const csrfService = {
    verifyToken: vi.fn(),
  } as unknown as CsrfService;

  const guard = new CsrfGuard(csrfService);

  function createContext(
    method: string,
    cookieToken?: string,
    headerToken?: string,
  ) {
    const request = {
      method,
      cookies: cookieToken ? { csrfToken: cookieToken } : {},
      headers: headerToken ? { 'x-csrf-token': headerToken } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow GET requests without a CSRF token', () => {
    const result = guard.canActivate(createContext('GET'));

    expect(result).toBe(true);
  });

  it('should allow HEAD requests without a CSRF token', () => {
    const result = guard.canActivate(createContext('HEAD'));

    expect(result).toBe(true);
  });

  it('should allow OPTIONS requests without a CSRF token', () => {
    const result = guard.canActivate(createContext('OPTIONS'));

    expect(result).toBe(true);
  });

  it('should reject a POST request without tokens', () => {
    expect(() => guard.canActivate(createContext('POST'))).toThrow(
      ForbiddenException,
    );
  });

  it('should reject mismatched cookie and header tokens', () => {
    expect(() =>
      guard.canActivate(
        createContext('POST', 'cookie-token', 'different-token'),
      ),
    ).toThrow(ForbiddenException);
  });

  it('should reject an invalid CSRF token', () => {
    vi.mocked(csrfService.verifyToken).mockReturnValue(false);

    expect(() =>
      guard.canActivate(
        createContext('POST', 'invalid-token', 'invalid-token'),
      ),
    ).toThrow(ForbiddenException);
  });

  it('should allow a valid matching CSRF token', () => {
    vi.mocked(csrfService.verifyToken).mockReturnValue(true);

    const result = guard.canActivate(
      createContext('POST', 'valid-token', 'valid-token'),
    );

    expect(result).toBe(true);

    expect(csrfService.verifyToken).toHaveBeenCalledWith('valid-token');
  });
});
