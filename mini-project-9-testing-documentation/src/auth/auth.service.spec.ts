import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { Session } from './schemas/session.schema.js';

describe('AuthService', () => {
  let authService: AuthService;

  let usersService: {
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  let sessionModel: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findByIdAndDelete: ReturnType<typeof vi.fn>;
  };

  const userId = new Types.ObjectId().toString();
  const sessionId = new Types.ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();

    usersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(async (payload) =>
        payload.type === 'access' ? 'access-token' : 'refresh-token',
      ),
      verifyAsync: vi.fn(),
    };

    const session = {
      _id: new Types.ObjectId(sessionId),
      refreshTokenHash: 'temporary',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      save: vi.fn().mockResolvedValue(undefined),
    };

    sessionModel = {
      create: vi.fn().mockResolvedValue(session),
      findOne: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      sessionModel as unknown as import('mongoose').Model<Session>,
    );
  });

  describe('register', () => {
    it('should register a new user and create tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      usersService.create.mockImplementation(async (data) => ({
        _id: new Types.ObjectId(userId),
        name: data.name,
        email: data.email,
      }));

      const result = await authService.register({
        name: 'John Doe',
        email: ' JOHN@EXAMPLE.COM ',
        password: 'Password123!',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('john@example.com');

      expect(usersService.create).toHaveBeenCalled();

      expect(sessionModel.create).toHaveBeenCalled();

      expect(result.message).toBe('Registration successful');
      expect(result.user.email).toBe('john@example.com');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should reject an already registered email', async () => {
      usersService.findByEmail.mockResolvedValue({
        email: 'john@example.com',
      });

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 4);

      usersService.findByEmail.mockResolvedValue({
        _id: new Types.ObjectId(userId),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });

      const result = await authService.login({
        email: ' JOHN@EXAMPLE.COM ',
        password: 'Password123!',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('john@example.com');

      expect(result.message).toBe('Login successful');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should reject an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject an incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 4);

      usersService.findByEmail.mockResolvedValue({
        _id: new Types.ObjectId(userId),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(sessionModel.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should reject an invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject a token with the wrong token type', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        sessionId,
        type: 'access',
      });

      await expect(authService.refresh('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should delete the session', async () => {
      sessionModel.findByIdAndDelete.mockResolvedValue({
        _id: sessionId,
      });

      const result = await authService.logout(sessionId);

      expect(sessionModel.findByIdAndDelete).toHaveBeenCalledWith(sessionId);

      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      usersService.findById.mockResolvedValue({
        _id: new Types.ObjectId(userId),
        name: 'John Doe',
        email: 'john@example.com',
      });

      const result = await authService.getProfile(userId);

      expect(result).toEqual({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should reject a deleted user', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(authService.getProfile(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
