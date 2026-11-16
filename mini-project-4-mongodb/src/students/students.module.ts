import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";

import { StudentSchema, Student } from "./schemas/student.schema.js";
import { StudentsController } from "./students.controller.js"
import {StudentsService} from "./students.service.js"

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Student.name,
                schema: StudentSchema,
            },
        ]),
    ],

    controllers: [StudentsController],

    providers: [StudentsService],
})

export class StudentsModule {}