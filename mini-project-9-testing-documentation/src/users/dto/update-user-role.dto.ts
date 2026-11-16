import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'admin',
    enum: ['user', 'admin'],
    description: 'New role for the user',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'admin'])
  role!: 'user' | 'admin';
}
