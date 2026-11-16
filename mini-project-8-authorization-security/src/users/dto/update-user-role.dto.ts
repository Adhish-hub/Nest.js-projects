import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'admin'])
  role!: 'user' | 'admin';
}
