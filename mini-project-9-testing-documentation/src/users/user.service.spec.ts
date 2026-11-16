import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { UsersService } from './users.service.js';
import { User } from './schemas/user.schema.js';

describe('UsersService', () => {
  let usersService: UsersService;

  let userModel: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findByIdAndUpdate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    userModel = {
      create: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
    };

    usersService = new UsersService(
      userModel as unknown as import('mongoose').Model<User>,
    );
  });

  it('should create a user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
    };

    userModel.create.mockResolvedValue(userData);

    const result = await usersService.create(userData);

    expect(userModel.create).toHaveBeenCalledWith(userData);
    expect(result).toEqual(userData);
  });

  it('should find a user by email and select the password', async () => {
    const user = {
      email: 'john@example.com',
      password: 'hashed-password',
    };

    const exec = vi.fn().mockResolvedValue(user);
    const select = vi.fn().mockReturnValue({ exec });

    userModel.findOne.mockReturnValue({ select });

    const result = await usersService.findByEmail('john@example.com');

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'john@example.com',
    });

    expect(select).toHaveBeenCalledWith('+password');
    expect(result).toEqual(user);
  });

  it('should return null for an invalid user ID', async () => {
    const result = await usersService.findById('invalid-id');

    expect(result).toBeNull();
    expect(userModel.findById).not.toHaveBeenCalled();
  });

  it('should find a user by valid ID', async () => {
    const id = new Types.ObjectId().toString();
    const user = { _id: id, name: 'John Doe' };

    const exec = vi.fn().mockResolvedValue(user);

    userModel.findById.mockReturnValue({ exec });

    const result = await usersService.findById(id);

    expect(userModel.findById).toHaveBeenCalledWith(id);
    expect(result).toEqual(user);
  });

  it('should reject an invalid ID when updating a role', async () => {
    await expect(
      usersService.updateRole('invalid-id', 'admin'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when the user does not exist', async () => {
    const id = new Types.ObjectId().toString();

    const exec = vi.fn().mockResolvedValue(null);
    const select = vi.fn().mockReturnValue({ exec });

    userModel.findByIdAndUpdate.mockReturnValue({ select });

    await expect(usersService.updateRole(id, 'admin')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update the user role', async () => {
    const id = new Types.ObjectId().toString();

    const user = {
      _id: id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    };

    const exec = vi.fn().mockResolvedValue(user);
    const select = vi.fn().mockReturnValue({ exec });

    userModel.findByIdAndUpdate.mockReturnValue({ select });

    const result = await usersService.updateRole(id, 'admin');

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { role: 'admin' },
      {
        new: true,
        runValidators: true,
      },
    );

    expect(result).toEqual(user);
  });
});
