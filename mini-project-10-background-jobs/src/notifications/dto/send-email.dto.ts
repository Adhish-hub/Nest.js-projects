import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: 'Welcome to our application',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiPropertyOptional({
    example: 'Thank you for registering!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  text?: string;

  @ApiPropertyOptional({
    example: '<h1>Welcome!</h1><p>Thanks for joining.</p>',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  html?: string;
}
