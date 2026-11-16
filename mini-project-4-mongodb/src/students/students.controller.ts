import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { StudentsService } from './students.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Query('course') course?: string, @Query('name') name?: string) {
    return this.studentsService.findAll(course, name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateStudentDto) {
    return this.studentsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.studentsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const student = await this.studentsService.remove(id);

    return {
      message: 'Student deleted successfully',
      student,
    };
  }
}
