import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { Session } from '../schemas/session.schema.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.accessToken as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (
        payload.type !== 'access' ||
        !Types.ObjectId.isValid(payload.sub) ||
        !Types.ObjectId.isValid(payload.sessionId)
      ) {
        throw new UnauthorizedException('Invalid access token');
      }

      const session = await this.sessionModel.findOne({
        _id: payload.sessionId,
        userId: payload.sub,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        throw new UnauthorizedException('Session is expired or revoked');
      }

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
