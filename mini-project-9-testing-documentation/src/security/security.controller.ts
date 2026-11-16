import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Response } from 'express';

import { CsrfService } from './csrf.service.js';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('csrf')
  @ApiOperation({ summary: 'Generate a CSRF token' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token generated and stored in a cookie',
  })
  getCsrfToken(@Res({ passthrough: true }) response: Response) {
    const token = this.csrfService.generateToken();

    response.cookie('csrfToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return {
      csrfToken: token,
    };
  }
}
