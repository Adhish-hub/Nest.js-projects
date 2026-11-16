import { BadRequestException, Injectable } from '@nestjs/common';

import { QueueService } from '../queue/queue.service.js';
import type { EmailJobData } from '../queue/queue.service.js';

import { SendEmailDto } from './dto/send-email.dto.js';
import { ScheduleEmailDto } from './dto/schedule-email.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly queueService: QueueService) {}

  // Add an email to the background queue
  async sendEmail(dto: SendEmailDto) {
    const emailData: EmailJobData = {
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
    };

    return this.queueService.addEmailJob(emailData);
  }

  // Schedule an email for future delivery
  async scheduleEmail(dto: ScheduleEmailDto) {
    const scheduledTime = new Date(dto.scheduledAt).getTime();

    const delay = scheduledTime - Date.now();

    if (delay <= 0) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    const emailData: EmailJobData = {
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
    };

    return this.queueService.addScheduledEmailJob(emailData, delay);
  }
}
