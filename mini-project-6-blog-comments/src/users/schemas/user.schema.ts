import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true,
    versionKey: false,
})

export class User{
    @Prop({
        required: true,
        trim: true,
        maxlength: 50,
    })
    name!: string;

    @Prop({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    })
    email!: string
}

export const UserSchema = SchemaFactory.createForClass(User);