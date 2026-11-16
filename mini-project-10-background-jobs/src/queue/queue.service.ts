import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

import { EMAIL_QUEUE, EMAIL_JOB } from './queue.constants.js';

export interface EmailJobData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async addEmailJob(data: EmailJobData) {
    const job = await this.emailQueue.add(EMAIL_JOB.SEND, data);

    return {
      jobId: job.id,
      message: 'Email job added to the queue',
    };
  }

  async addScheduledEmailJob(data: EmailJobData, delayInMilliseconds: number) {
    const job = await this.emailQueue.add(EMAIL_JOB.SEND, data, {
      delay: delayInMilliseconds,
    });

    return {
      jobId: job.id,
      message: 'Scheduled email job added to the queue',
    };
  }

  async getQueueStats() {
    const counts = await this.emailQueue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    );

    return {
      queue: EMAIL_QUEUE,
      counts,
    };
  }

  async getJobDetails(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    const state = await job.getState();

    return {
      jobId: job.id,
      name: job.name,
      state,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason ?? null,
      timestamp: job.timestamp,
      processedOn: job.processedOn ?? null,
      finishedOn: job.finishedOn ?? null,
    };
  }

  async getRecentJobs() {
    const jobs = await this.emailQueue.getJobs(
      ['waiting', 'active', 'completed', 'failed', 'delayed'],
      0,
      19,
      true,
    );

    return Promise.all(
      jobs.map(async (job) => ({
        jobId: job.id,
        name: job.name,
        state: await job.getState(),
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
      })),
    );
  }
}
