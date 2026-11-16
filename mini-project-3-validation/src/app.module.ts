import { Module } from '@nestjs/common';

import { StudentsController } from './students/students.controller.js';
import { StudentsService } from './students/students.service.js';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class AppModule {}
