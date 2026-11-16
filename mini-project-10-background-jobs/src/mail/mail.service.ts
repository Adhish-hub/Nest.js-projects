import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

import type { EmailJobData } from '../queue/queue.service.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter: Transporter;

  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');

    const port = Number(this.configService.get<string>('SMTP_PORT', '2525'));

    const user = this.configService.get<string>('SMTP_USER');

    const password = this.configService.get<string>('SMTP_PASSWORD');

    const secure =
      this.configService.get<string>('SMTP_SECURE', 'false') === 'true';

    if (!host || !user || !password) {
      throw new Error(
        'SMTP_HOST, SMTP_USER and SMTP_PASSWORD must be configured',
      );
    }

    this.from = this.configService.get<string>(
      'MAIL_FROM',
      'NestJS Notifications <notifications@example.com>',
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });
  }

  async sendEmail(data: EmailJobData) {
    try {
      const result = await this.transporter.sendMail({
        from: this.from,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      });

      this.logger.log(
        `Email sent successfully. Message ID: ${result.messageId}`,
      );

      return {
        messageId: result.messageId,
        accepted: result.accepted,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email error';

      this.logger.error(`Email delivery failed: ${message}`);

      throw new InternalServerErrorException('Email delivery failed');
    }
  }
}
