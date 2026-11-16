import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Comment } from './schemas/comment.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { Post } from '../posts/schemas/post.schema.js';

import type { CreateCommentDto } from './dto/create-comment.dto.js';
import type { UpdateCommentDto } from './dto/update-comment.dto.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  async create(data: CreateCommentDto) {
    this.validateId(data.authorId);
    this.validateId(data.postId);

    const [user, post] = await Promise.all([
      this.userModel.findById(data.authorId).select('_id').exec(),
      this.postModel.findById(data.postId).select('_id').exec(),
    ]);

    if (!user) {
      throw new NotFoundException('Comment author not found');
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentModel.create({
      content: data.content,
      author: data.authorId,
      post: data.postId,
    });

    return this.commentModel
      .findById(comment._id)
      .populate('author', 'name email')
      .populate('post', 'title category')
      .exec();
  }

  async findByPost(postId: string, page = 1, limit = 10) {
    this.validateId(postId);

    const post = await this.postModel.findById(postId).select('_id').exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentModel
        .find({ post: postId })
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.commentModel.countDocuments({ post: postId }).exec(),
    ]);

    return {
      data: comments,
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

    const comment = await this.commentModel
      .findById(id)
      .populate('author', 'name email')
      .populate('post', 'title category')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, data: UpdateCommentDto) {
    this.validateId(id);

    const comment = await this.commentModel
      .findByIdAndUpdate(
        id,
        { content: data.content },
        {
          new: true,
          runValidators: true,
        },
      )
      .populate('author', 'name email')
      .populate('post', 'title category')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async remove(id: string) {
    this.validateId(id);

    const comment = await this.commentModel
      .findByIdAndDelete(id)
      .populate('author', 'name email')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      message: 'Comment deleted successfully',
      comment,
    };
  }

  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid MongoDB ID format');
    }
  }
}
