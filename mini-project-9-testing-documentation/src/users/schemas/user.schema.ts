import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserRole = "user" | "admin"

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    required: true,
    trim: true,
    maxlength: 50,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    required: true,
    select: false,
  })
  password!: string;

  @Prop({
    type: String,
    enum: ["user", "admin"],
    default: "user",
  })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
