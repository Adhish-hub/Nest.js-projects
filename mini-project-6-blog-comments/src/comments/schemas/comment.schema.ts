import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { User } from '../../users/schemas/user.schema.js';
import { Post } from '../../posts/schemas/post.schema.js';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Comment {
  @Prop({
    required: true,
    trim: true,
    maxlength: 2000,
  })
  content!: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  author!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Post.name,
    required: true,
  })
  post!: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
