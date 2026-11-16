import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Body,
  Query,
} from '@nestjs/common';

interface Student {
  id: number;
  name: string;
  course: string;
}

interface CreateStudentDto {
  name: string;
  course: string;
}

interface UpdateStudentDto {
  name?: string;
  course?: string;
}

@Controller()
export class AppController {
  private students: Student[] = [
    { id: 1, name: 'Rahul', course: 'Node.js' },
    { id: 2, name: 'Priya', course: 'React' },
  ];

  private nextId = 3;

  @Get('hello')
  getHello(): string {
    return 'Hello from NestJS!';
  }

  @Get('status')
  getStatus(): object {
    return {
      success: true,
      message: 'NestJS API is running',
      project: 'nest-hello-api',
    };
  }

  @Get('students')
  getStudents(
    @Query('course') course?: string,
    @Query('name') name?: string,
  ): Student[] {
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

  @Get('students/:id')
  getStudent(@Param('id', ParseIntPipe) id: number): Student {
    const student = this.findStudent(id);
    return student;
  }

  @Post('students')
  createStudent(@Body() body: CreateStudentDto): Student {
    const name = body.name?.trim();
    const course = body.course?.trim();

    if (!name || !course) {
      throw new BadRequestException('Name and course are required');
    }

    const student: Student = {
      id: this.nextId++,
      name,
      course,
    };

    this.students.push(student);

    return student;
  }

  @Patch('students/:id')
  updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStudentDto,
  ): Student {
    const student = this.findStudent(id);

    if (body.name !== undefined) {
      const name = body.name.trim();

      if (!name) {
        throw new BadRequestException('Name cannot be empty');
      }

      student.name = name;
    }

    if (body.course !== undefined) {
      const course = body.course.trim();

      if (!course) {
        throw new BadRequestException('Course cannot be empty');
      }

      student.course = course;
    }

    return student;
  }

  @Delete('students/:id')
  deleteStudent(@Param('id', ParseIntPipe) id: number): object {
    const student = this.findStudent(id);

    this.students = this.students.filter((item) => item.id !== id);

    return {
      message: 'Student deleted successfully',
      student,
    };
  }

  private findStudent(id: number): Student {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Student ID must be a positive integer');
    }

    const student = this.students.find((item) => item.id === id);

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }
}
