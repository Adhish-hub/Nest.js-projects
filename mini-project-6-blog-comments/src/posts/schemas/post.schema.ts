import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { User } from '../../users/schemas/user.schema.js';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Post {
  @Prop({
    required: true,
    trim: true,
    maxlength: 150,
  })
  title!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 20000,
  })
  content!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50,
  })
  category!: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  author!: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
