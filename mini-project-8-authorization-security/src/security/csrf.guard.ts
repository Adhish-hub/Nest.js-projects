import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Request } from 'express';

import { CsrfService } from './csrf.service.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

    if (safeMethods.includes(request.method)) {
      return true;
    }

    const cookieToken = request.cookies?.csrfToken as string | undefined;

    const headerValue = request.headers['x-csrf-token'];

    const headerToken =
      typeof headerValue === 'string' ? headerValue : undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token is missing or does not match');
    }

    if (!this.csrfService.verifyToken(headerToken)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
