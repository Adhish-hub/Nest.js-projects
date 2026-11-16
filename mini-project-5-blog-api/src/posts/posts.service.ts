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
import type { QueryPostsDto } from './dto/query-posts.dto.js';

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
    await this.ensureAuthorExists(data.authorId);

    const post = await this.postModel.create({
      title: data.title,
      content: data.content,
      category: data.category,
      author: data.authorId,
      published: data.published ?? false,
    });

    return this.postModel
      .findById(post._id)
      .populate('author', 'name email')
      .exec();
  }

  async findAll(query: QueryPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.authorId) {
      this.validateId(query.authorId);
      filter.author = query.authorId;
    }

    if (query.search) {
      const escapedSearch = this.escapeRegex(query.search);

      filter.title = {
        $regex: escapedSearch,
        $options: 'i',
      };
    }

    const sortOrder = query.order === 'asc' ? 1 : -1;

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    this.validateId(id);

    const post = await this.postModel
      .findById(id)
      .populate('author', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: string, data: UpdatePostDto) {
    this.validateId(id);

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    if (data.category !== undefined) {
      updateData.category = data.category;
    }

    if (data.published !== undefined) {
      updateData.published = data.published;
    }

    if (data.authorId !== undefined) {
      this.validateId(data.authorId);
      await this.ensureAuthorExists(data.authorId);
      updateData.author = data.authorId;
    }

    const post = await this.postModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('author', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async remove(id: string) {
    this.validateId(id);

    const post = await this.postModel
      .findByIdAndDelete(id)
      .populate('author', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return {
      message: 'Post deleted successfully',
      post,
    };
  }

  private async ensureAuthorExists(authorId: string) {
    const author = await this.userModel.findById(authorId).select('_id').exec();

    if (!author) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }
  }

  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid MongoDB ID format');
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
