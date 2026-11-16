import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';

import type { INestApplication } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import request from 'supertest';
import cookieParser from 'cookie-parser';

import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';

import { SecurityController } from '../src/security/security.controller.js';
import { CsrfService } from '../src/security/csrf.service.js';

import { AdminController } from '../src/admin/admin.controller.js';
import { UsersService } from '../src/users/users.service.js';
import { RolesGuard } from '../src/common/guards/roles.guard.js';

describe('Mini-Project 9 HTTP integration tests', () => {
  let app: INestApplication;

  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  };

  const csrfService = {
    generateToken: vi.fn(),
    verifyToken: vi.fn(),
  };

  const usersService = {
    findAll: vi.fn().mockResolvedValue([
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
    ]),

    findById: vi.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    }),

    updateRole: vi.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    }),
  };

  const jwtGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();

      request.user = {
        sub: '507f1f77bcf86cd799439011',
        sessionId: '507f191e810c19729de860ea',
        type: 'access',
      };

      return true;
    },
  };

  const rolesGuard = {
    canActivate: () => true,
  };

  
beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController, SecurityController, AdminController],

    providers: [
      {
        provide: AuthService,
        useValue: authService,
      },
      {
        provide: CsrfService,
        useValue: csrfService,
      },
      {
        provide: UsersService,
        useValue: usersService,
      },
      {
        provide: RolesGuard,
        useValue: rolesGuard,
      },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwtGuard)
    .compile();

  app = moduleRef.createNestApplication();

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
});


  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Authentication endpoints', () => {
    it('POST /auth/register should register a user', async () => {
      authService.register.mockResolvedValue({
        message: 'Registration successful',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body.message).toBe('Registration successful');

      expect(response.body.user.email).toBe('john@example.com');

      expect(response.headers['set-cookie']).toBeDefined();

      expect(authService.register).toHaveBeenCalled();
    });

    it('POST /auth/login should login a user', async () => {
      authService.login.mockResolvedValue({
        message: 'Login successful',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body.message).toBe('Login successful');

      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('POST /auth/refresh should reject a missing refresh cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);

      expect(response.body.message).toBe('Refresh token is missing');

      expect(authService.refresh).not.toHaveBeenCalled();
    });

    it('GET /auth/profile should return the current profile', async () => {
      authService.getProfile.mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
      });

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(200);

      expect(response.body).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(authService.getProfile).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('POST /auth/logout should log out the current session', async () => {
      authService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201);

      expect(response.body.message).toBe('Logged out successfully');

      expect(authService.logout).toHaveBeenCalledWith(
        '507f191e810c19729de860ea',
      );

      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Security endpoints', () => {
    it('GET /security/csrf should generate a CSRF token', async () => {
      csrfService.generateToken.mockReturnValue('test-csrf-token');

      const response = await request(app.getHttpServer())
        .get('/security/csrf')
        .expect(200);

      expect(response.body.csrfToken).toBe('test-csrf-token');

      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Admin endpoints', () => {
    it('GET /admin/users should return all users', async () => {
      usersService.findAll.mockResolvedValue([
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .expect(200);

      expect(response.body).toHaveLength(1);

      expect(response.body[0].role).toBe('admin');
    });

    it('PATCH /admin/users/:id/role should update a user role', async () => {
      usersService.updateRole.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      });

      const response = await request(app.getHttpServer())
        .patch('/admin/users/507f1f77bcf86cd799439011/role')
        .send({
          role: 'admin',
        })
        .expect(200);

      expect(response.body.role).toBe('admin');

      expect(usersService.updateRole).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'admin',
      );
    });
  });
});
