import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, MongoServerError } from 'mongoose';

import { User } from './schemas/user.schema.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(data: CreateUserDto) {
    try {
      return await this.userModel.create(data);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('A user with this email already exists');
      }

      throw error;
    }
  }

  findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    this.validateId(id);

    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid MongoDB ID format');
    }
  }
}
