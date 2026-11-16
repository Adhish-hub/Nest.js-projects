import { describe, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

import { CsrfService } from './csrf.service.js';

describe('CsrfService', () => {
  const configService = {
    getOrThrow: vi.fn().mockReturnValue('test-csrf-secret'),
  } as unknown as ConfigService;

  const csrfService = new CsrfService(configService);

  it('should generate a CSRF token', () => {
    const token = csrfService.generateToken();

    expect(token).toBeTruthy();
    expect(token.split('.')).toHaveLength(2);
  });

  it('should verify a valid CSRF token', () => {
    const token = csrfService.generateToken();

    expect(csrfService.verifyToken(token)).toBe(true);
  });

  it('should reject a modified token', () => {
    const token = csrfService.generateToken();

    const modifiedToken = `${token}modified`;

    expect(csrfService.verifyToken(modifiedToken)).toBe(false);
  });

  it('should reject an empty token', () => {
    expect(csrfService.verifyToken('')).toBe(false);
  });

  it('should reject a token with an invalid structure', () => {
    expect(csrfService.verifyToken('invalid.token.structure')).toBe(false);
  });
});
