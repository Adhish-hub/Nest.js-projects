import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true,
    versionKey: false,
})

export class Student {
    @Prop({
        required: true,
        trim: true,
        maxlength: 50,
    })
    name!: string;

    @Prop({
        required: true,
        trim: true,
        maxlength: 50,
    })
    course!: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);