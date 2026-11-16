import { Logger } from '@nestjs/common';

import { Processor, WorkerHost } from '@nestjs/bullmq';

import type { Job } from 'bullmq';

import { EMAIL_QUEUE, EMAIL_JOB } from '../queue/queue.constants.js';

import type { EmailJobData } from '../queue/queue.service.js';

import { MailService } from '../mail/mail.service.js';

@Processor(EMAIL_QUEUE, {
  concurrency: 5,
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<unknown> {
    switch (job.name) {
      case EMAIL_JOB.SEND:
        return this.handleEmail(job);

      default:
        throw new Error(`Unsupported email job: ${job.name}`);
    }
  }

  private async handleEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id} for ${job.data.to}`);

    const result = await this.mailService.sendEmail(job.data);

    this.logger.log(`Email job ${job.id} completed successfully`);

    return result;
  }
}
