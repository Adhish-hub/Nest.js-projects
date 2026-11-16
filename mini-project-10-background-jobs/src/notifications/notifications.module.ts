import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module.js';
import { MailModule } from '../mail/mail.module.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { EmailProcessor } from '../processors/email.processor.js';

@Module({
  imports: [QueueModule, MailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailProcessor],
})
export class NotificationsModule {}
