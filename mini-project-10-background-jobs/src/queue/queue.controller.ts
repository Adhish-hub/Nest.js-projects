import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service.js';

@ApiTags('Queue Monitoring')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get email queue statistics',
  })
  getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Get('jobs')
  @ApiOperation({
    summary: 'Get recent email jobs',
  })
  getRecentJobs() {
    return this.queueService.getRecentJobs();
  }

  @Get('jobs/:jobId')
  @ApiOperation({
    summary: 'Get details of a specific email job',
  })
  @ApiNotFoundResponse({
    description: 'Job not found',
  })
  getJobDetails(@Param('jobId') jobId: string) {
    return this.queueService.getJobDetails(jobId);
  }
}
