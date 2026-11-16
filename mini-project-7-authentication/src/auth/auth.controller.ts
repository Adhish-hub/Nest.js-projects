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
import type { Request, Response } from 'express';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

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
  @Post('logout')
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(user.sessionId);

    this.clearCookies(response);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
