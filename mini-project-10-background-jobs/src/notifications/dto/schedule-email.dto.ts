import { ApiProperty } from '@nestjs/swagger';

import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class ScheduleEmailDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: 'Your scheduled notification',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    example: 'This is your scheduled notification.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;

  @ApiProperty({
    example: '2026-12-01T10:00:00.000Z',
    description: 'Future date/time in ISO 8601 format',
  })
  @IsDateString()
  scheduledAt: string;
}
