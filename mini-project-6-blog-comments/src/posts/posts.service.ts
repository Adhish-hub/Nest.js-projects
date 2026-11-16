import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Post } from './schemas/post.schema.js';
import { User } from '../users/schemas/user.schema.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(data: CreatePostDto) {
    this.validateId(data.authorId);

    const user = await this.userModel
      .findById(data.authorId)
      .select('_id')
      .exec();

    if (!user) {
      throw new NotFoundException('Author not found');
    }

    const post = await this.postModel.create({
      title: data.title,
      content: data.content,
      category: data.category,
      author: data.authorId,
    });

    return this.postModel
      .findById(post._id)
      .populate('author', 'name email')
      .exec();
  }

  findAll() {
    return this.postModel
      .find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    this.validateId(id);

    const post = await this.postModel
      .findById(id)
      .populate('author', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, data: UpdatePostDto) {
    this.validateId(id);

    const updateData: Record<string, unknown> = {
      title: data.title,
      content: data.content,
      category: data.category,
    };

    if (data.authorId !== undefined) {
      this.validateId(data.authorId);

      const user = await this.userModel
        .findById(data.authorId)
        .select('_id')
        .exec();

      if (!user) {
        throw new NotFoundException('Author not found');
      }

      updateData.author = data.authorId;
    }

    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    const post = await this.postModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('author', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async remove(id: string) {
    this.validateId(id);

    const post = await this.postModel.findByIdAndDelete(id).exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      message: 'Post deleted successfully',
      post,
    };
  }

  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid MongoDB ID');
    }
  }
}
