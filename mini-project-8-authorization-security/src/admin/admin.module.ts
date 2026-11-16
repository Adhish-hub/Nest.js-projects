import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { AdminController } from './admin.controller.js';

import { RolesGuard } from '../common/guards/roles.guard.js';

@Module({
  imports: [UsersModule, AuthModule],

  controllers: [AdminController],

  providers: [RolesGuard],
})
export class AdminModule {}
