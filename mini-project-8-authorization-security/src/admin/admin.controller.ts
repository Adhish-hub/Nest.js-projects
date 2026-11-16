import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { UsersService } from '../users/users.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { RolesGuard } from '../common/guards/roles.guard.js';

import { Roles } from '../common/decorators/roles.decorator.js';

import { UpdateUserRoleDto } from '../users/dto/update-user-role.dto.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, body.role);
  }
}
