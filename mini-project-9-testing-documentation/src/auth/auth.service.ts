import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service.js';
import { Session } from './schemas/session.schema.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshExpiry(): Date {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private async createTokens(userId: string, sessionId: string) {
    const accessPayload: JwtPayload = {
      sub: userId,
      sessionId,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      sessionId,
      type: 'refresh',
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
      jwtid: randomUUID(),
    });

    return { accessToken, refreshToken };
  }

  private async createSession(userId: string) {
    const session = await this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      refreshTokenHash: 'temporary',
      expiresAt: this.getRefreshExpiry(),
    });

    const tokens = await this.createTokens(userId, session._id.toString());

    session.refreshTokenHash = this.hashToken(tokens.refreshToken);
    await session.save();

    return tokens;
  }

  async register(data: RegisterDto) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    let user;

    try {
      user = await this.usersService.create({
        name: data.name.trim(),
        email,
        password: hashedPassword,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }

    const tokens = await this.createSession(user._id.toString());

    return {
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      ...tokens,
    };
  }

  async login(data: LoginDto) {
    const email = data.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.createSession(user._id.toString());

    return {
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (
      payload.type !== 'refresh' ||
      !Types.ObjectId.isValid(payload.sub) ||
      !Types.ObjectId.isValid(payload.sessionId)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionModel.findOne({
      _id: payload.sessionId,
      userId: payload.sub,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const matches = session.refreshTokenHash === this.hashToken(refreshToken);

    if (!matches) {
      throw new UnauthorizedException('Refresh token has already been used');
    }

    const tokens = await this.createTokens(payload.sub, payload.sessionId);

    session.refreshTokenHash = this.hashToken(tokens.refreshToken);
    session.expiresAt = this.getRefreshExpiry();

    await session.save();

    return tokens;
  }

  async logout(sessionId: string) {
    await this.sessionModel.findByIdAndDelete(sessionId);

    return {
      message: 'Logged out successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }
}
