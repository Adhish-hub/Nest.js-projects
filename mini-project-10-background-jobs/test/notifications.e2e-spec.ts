import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { NotificationsController } from '../src/notifications/notifications.controller.js';
import { NotificationsService } from '../src/notifications/notifications.service.js';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;

  const notificationsService = {
    sendEmail: vi.fn(),
    scheduleEmail: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /notifications/email should accept valid email data', async () => {
    notificationsService.sendEmail.mockResolvedValue({
      jobId: '101',
      message: 'Email job added to the queue',
    });

    await request(app.getHttpServer())
      .post('/notifications/email')
      .send({
        to: 'user@example.com',
        subject: 'Welcome',
        text: 'Welcome to our application',
      })
      .expect(202)
      .expect({
        jobId: '101',
        message: 'Email job added to the queue',
      });
  });

  it('POST /notifications/email should reject an invalid email', async () => {
    await request(app.getHttpServer())
      .post('/notifications/email')
      .send({
        to: 'invalid-email',
        subject: 'Welcome',
        text: 'Hello',
      })
      .expect(400);
  });

  it('POST /notifications/email should reject unknown properties', async () => {
    await request(app.getHttpServer())
      .post('/notifications/email')
      .send({
        to: 'user@example.com',
        subject: 'Welcome',
        unexpectedField: 'not allowed',
      })
      .expect(400);
  });

  it('POST /notifications/email/schedule should accept valid data', async () => {
    notificationsService.scheduleEmail.mockResolvedValue({
      jobId: '102',
      message: 'Scheduled email job added to the queue',
    });

    await request(app.getHttpServer())
      .post('/notifications/email/schedule')
      .send({
        to: 'user@example.com',
        subject: 'Scheduled email',
        text: 'This is a scheduled email',
        scheduledAt: new Date(Date.now() + 60_000).toISOString(),
      })
      .expect(202);
  });
});
