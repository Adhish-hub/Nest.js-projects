import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import type { CreateStudentDto } from "./dto/create-student.dto.js";

import type { UpdateStudentDto } from "./dto/update-student.dto.js";

export interface Student {
    id: number;
    name: string;
    course: string;
};

@Injectable()
export class StudentsService {
  private students: Student[] = [
    { id: 1, name: 'Rahul', course: 'Node.js' },
    { id: 2, name: 'Priya', course: 'React' },
  ];

  private nextId = 3;

  findAll(course?: string, name?: string): Student[] {
    let result = this.students;

    if(course){
        result = result.filter(
            (student) => student.course.toLowerCase() === course.toLowerCase(),
        );
    }

    if(name){
        result = result.filter((student) => 
          student.name.toLowerCase().includes(name.toLowerCase()),
        );
    }

    return result;
  }

  findOne(id: number): Student{
    this.validateId(id);

    const student = this.students.find(
        (item) => item.id === id,
    );

    if(!student){
        throw new NotFoundException(
            `Student with ID ${id} not found.`,
        );
    }

    return student;
  }

  create(data: CreateStudentDto): Student {
    const student: Student = {
        id: this.nextId++,
        name: data.name,
        course: data.course,
    };

    this.students.push(student);

    return student;
  }

  update(id: number, data:UpdateStudentDto): Student{
    const student = this.findOne(id);

    if(data.name !== undefined){
        student.name = data.name;
    }

    if(data.course !== undefined){
        student.course = data.course;
    }

    return student;
  }

  remove(id: number): Student{
    const student = this.findOne(id);

    this.students = this.students.filter(
        (item) => item.id !== id,
    );

    return student;
  }

  private validateId(id: number): void{
    if(!Number.isInteger(id) || id <= 0){
        throw new BadRequestException(
            "Student ID must be an positive integer.",
        );
    }
  }
}
