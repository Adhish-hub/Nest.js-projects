import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Session {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
  })
  refreshTokenHash!: string;

  @Prop({
    required: true,
  })
  expiresAt!: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
