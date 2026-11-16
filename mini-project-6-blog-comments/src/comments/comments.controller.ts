import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException
} from '@nestjs/common';

import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('comments')
  create(@Body() body: CreateCommentDto) {
    return this.commentsService.create(body);
  }

  @Get('posts/:postId/comments')
  findByPost(
    @Param('postId') postId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page === undefined ? 1 : Number(page);
    const parsedLimit = limit === undefined ? 10 : Number(limit);

    if (
      !Number.isInteger(parsedPage) ||
      !Number.isInteger(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      throw new BadRequestException(
        'Page must be a positive integer and limit must be between 1 and 100',
      );
    }

    return this.commentsService.findByPost(postId, parsedPage, parsedLimit);
  }

  @Get('comments/:id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch('comments/:id')
  update(@Param('id') id: string, @Body() body: UpdateCommentDto) {
    return this.commentsService.update(id, body);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
