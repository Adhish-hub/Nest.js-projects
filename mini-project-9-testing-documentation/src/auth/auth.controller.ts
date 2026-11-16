import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import type { Request, Response } from 'express';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

@ApiTags('Authentication')
@ApiSecurity('csrf-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = process.env.NODE_ENV === 'production';

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookies(response: Response) {
    const secure = process.env.NODE_ENV === 'production';

    response.clearCookie('accessToken', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/auth',
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(body);

    this.setCookies(response, result.accessToken, result.refreshToken);

    return {
      message: result.message,
      user: result.user,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({ status: 201, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body);

    this.setCookies(response, result.accessToken, result.refreshToken);

    return {
      message: result.message,
      user: result.user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 201, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Refresh token invalid or missing' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.authService.refresh(refreshToken);

    this.setCookies(response, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Tokens refreshed successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @Post('logout')
  @ApiOperation({ summary: 'Logout the current session' })
  @ApiResponse({ status: 201, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(user.sessionId);

    this.clearCookies(response);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @Get('profile')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async profile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
