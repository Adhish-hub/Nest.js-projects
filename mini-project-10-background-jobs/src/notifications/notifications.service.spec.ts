import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { QueueService } from '../queue/queue.service.js';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const queueService = {
    addEmailJob: vi.fn(),
    addScheduledEmailJob: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotificationsService(queueService as unknown as QueueService);
  });

  it('should add an email job to the queue', async () => {
    queueService.addEmailJob.mockResolvedValue({
      jobId: '123',
      message: 'Email job added to the queue',
    });

    const result = await service.sendEmail({
      to: 'user@example.com',
      subject: 'Welcome',
      text: 'Welcome to our application',
    });

    expect(queueService.addEmailJob).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome',
      text: 'Welcome to our application',
      html: undefined,
    });

    expect(result.jobId).toBe('123');
  });

  it('should reject a scheduled email in the past', async () => {
    const pastDate = new Date(Date.now() - 60_000).toISOString();

    await expect(
      service.scheduleEmail({
        to: 'user@example.com',
        subject: 'Past email',
        text: 'This should not be scheduled',
        scheduledAt: pastDate,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(queueService.addScheduledEmailJob).not.toHaveBeenCalled();
  });

  it('should schedule a future email', async () => {
    queueService.addScheduledEmailJob.mockResolvedValue({
      jobId: '456',
      message: 'Scheduled email job added to the queue',
    });

    const futureDate = new Date(Date.now() + 60_000).toISOString();

    const result = await service.scheduleEmail({
      to: 'user@example.com',
      subject: 'Future email',
      text: 'This is a scheduled email',
      scheduledAt: futureDate,
    });

    expect(queueService.addScheduledEmailJob).toHaveBeenCalled();

    expect(result.jobId).toBe('456');
  });
});
