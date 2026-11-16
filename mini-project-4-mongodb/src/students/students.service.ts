import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";

import { isValidObjectId, Model } from "mongoose";

import { Student } from "./schemas/student.schema.js";

import type { CreateStudentDto } from "./dto/create-student.dto.js";
import type { UpdateStudentDto } from "./dto/update-student.dto.js";

@Injectable()
export class StudentsService {
    constructor(
        @InjectModel(Student.name)
        private readonly studentModel: Model<Student>,
    ) {}

    findAll(course?: string, name?: string) {
        const filter: Record<string, unknown> = {};

        if(course){
            filter.course = new RegExp(`^${this.escapeRegex(course)}$`, 'i');
        }

        if(name) {
          filter.name = new RegExp(this.escapeRegex(name), 'i');
        }

        return this.studentModel.find(filter).exec();
    }

    async findOne(id: string){
        this.validateId(id);

        const student = await this.studentModel
          .findById(id)
          .exec();

        if(!student){
            throw new NotFoundException(
                `Student with id ${id} not found.`,
            );
        }  

        return student
    }

    create(data: CreateStudentDto){
        return this.studentModel.create(data);
    }

    async update(id: string, data: UpdateStudentDto){
        this.validateId(id);

        const student = await this.studentModel
          .findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
            },
          )
          .exec();

        if(!student){
            throw new NotFoundException(
                `Student with id ${id} not found.`,
            );
        }
        
        return student;
    }

    async remove(id: string){
        this.validateId(id);

        const student = await this.studentModel
          .findByIdAndDelete(id)
          .exec();

        if(!student){
            throw new NotFoundException(
                `Student with id ${id} not found.`,
            );
        }
        
        return student;
    }

    private validateId(id: string): void{
        if(!isValidObjectId(id)){
            throw new BadRequestException(
                `Invalid student id format.`
            );
        }
    }

    private escapeRegex(value: string): string {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
