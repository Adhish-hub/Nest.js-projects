import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

export interface Student {
    id: number;
    name: string;
    course: string;
}

export interface CreateStudentDto {
    name: string;
    course: string;
}

export interface UpdateStudentDto {
    name?: string;
    course?: string;
}

@Injectable() // itmakes StudentsService available for NestJS dependency injection.
export class StudentsService {
  private students: Student[] = [
    //private students stores the temporary student records.
    { id: 1, name: 'Rahul', course: 'Node.js' },
    { id: 2, name: 'Priya', course: 'React' },
  ];

  private nextId = 3;

  findAll(course?: string, name?: string): Student[] {
    let result = this.students;

    if (course) {
      result = result.filter(
        (student) => student.course.toLowerCase() === course.toLowerCase(),
      );
    }

    if (name) {
      result = result.filter((student) =>
        student.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    return result;
  }

  findOne(id: number): Student {
    this.validateId(id);
    // validateId() is a private helper used internally by the service.

    const student = this.students.find((item) => item.id === id);

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  create(data: CreateStudentDto): Student {
    if (
      !data ||
      typeof data.name !== 'string' ||
      typeof data.course !== 'string'
    ) {
      throw new BadRequestException(
        'Name and course must be provided as strings.',
      );
    }

    const name = data.name.trim();
    const course = data.course.trim();

    if (!name || !course) {
      throw new BadRequestException('Name and course can not be empty');
    }

    const student: Student = {
      id: this.nextId++,
      name,
      course,
    };

    this.students.push(student);

    return student;
  }

  update(id: number, data: UpdateStudentDto): Student {
    const student = this.findOne(id);

    if (!data || typeof data !== 'object') {
      throw new BadRequestException('A valid update body is required.');
    }

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || !data.name.trim()) {
        throw new BadRequestException('Name must be a non-empty string.');
      }

      student.name = data.name.trim();
    }

    if (data.course !== undefined) {
      if (typeof data.course !== 'string' || !data.course.trim()) {
        throw new BadRequestException('Corse must be a non-empty string.');
      }

      student.course = data.course.trim();
    }

    return student;
  }

  remove(id: number): Student {
    const student = this.findOne(id);

    this.students = this.students.filter((item) => item.id !== id);

    return student;
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Student ID must be a positive integer.');
    }
  }
}