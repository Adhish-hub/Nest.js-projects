import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from '../users/users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UpdateUserRoleDto } from '../users/dto/update-user-role.dto.js';

@ApiTags('Administration')
@ApiCookieAuth('accessToken')
@ApiSecurity('csrf-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all registered users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update a user role (admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiResponse({ status: 400, description: 'Invalid ID or role' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, body.role);
  }
}
