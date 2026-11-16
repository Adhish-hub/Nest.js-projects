import { Module } from '@nestjs/common';

import { SecurityController } from './security.controller.js';

import { CsrfService } from './csrf.service.js';

@Module({
  controllers: [SecurityController],

  providers: [CsrfService],

  exports: [CsrfService],
})
export class SecurityModule {}
