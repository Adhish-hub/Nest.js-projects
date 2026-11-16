import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';

import { Comment, CommentSchema } from './schemas/comment.schema.js';

import { User, UserSchema } from '../users/schemas/user.schema.js';

import { Post, PostSchema } from '../posts/schemas/post.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
