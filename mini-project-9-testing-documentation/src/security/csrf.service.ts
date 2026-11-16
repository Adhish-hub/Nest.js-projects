import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class CsrfService {
  constructor(private readonly configService: ConfigService) {}

  generateToken(): string {
    const nonce = randomBytes(32).toString('hex');

    const secret = this.configService.getOrThrow<string>('CSRF_SECRET');

    const signature = createHmac('sha256', secret).update(nonce).digest('hex');

    return `${nonce}.${signature}`;
  }

  verifyToken(token: string): boolean {
    try {
      const parts = token.split('.');

      if (parts.length !== 2) {
        return false;
      }

      const [nonce, signature] = parts;

      if (!nonce || !/^[a-f0-9]{64}$/i.test(nonce)) {
        return false;
      }

      if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
        return false;
      }

      const secret = this.configService.getOrThrow<string>('CSRF_SECRET');

      const expectedSignature = createHmac('sha256', secret)
        .update(nonce)
        .digest('hex');

      const actualBuffer = Buffer.from(signature, 'hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      return timingSafeEqual(actualBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }
}
