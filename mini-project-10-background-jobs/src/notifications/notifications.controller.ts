import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { NotificationsService } from './notifications.service.js';

import { SendEmailDto } from './dto/send-email.dto.js';
import { ScheduleEmailDto } from './dto/schedule-email.dto.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Send an email through the background queue
  @Post('email')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Add an email notification to the background queue',
  })
  @ApiAcceptedResponse({
    description: 'Email job successfully accepted for processing',
  })
  @ApiBadRequestResponse({
    description: 'Invalid email request',
  })
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.notificationsService.sendEmail(dto);
  }

  // Schedule an email for future delivery
  @Post('email/schedule')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Schedule an email notification for later',
  })
  @ApiAcceptedResponse({
    description: 'Scheduled email job successfully added',
  })
  @ApiBadRequestResponse({
    description: 'Invalid email or scheduled time',
  })
  async scheduleEmail(@Body() dto: ScheduleEmailDto) {
    return this.notificationsService.scheduleEmail(dto);
  }
}
