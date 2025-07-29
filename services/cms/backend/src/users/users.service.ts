import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Create an ADMIN user (used by the bootstrap logic or special routes).
   */
  async createAdminUser(dto: CreateUserDto): Promise<User> {
    dto.role = UserRole.ADMIN;
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = new this.userModel({ ...dto, password: hashed });
      return await user.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new BadRequestException('A user with this email already exists.');
      }
      throw new InternalServerErrorException('Failed to create admin user.');
    }
  }

  /**
   * Create an HR user. Only the admin can call this (controller enforces).
   */
  async createHRUser(dto: CreateUserDto): Promise<User> {
    dto.role = UserRole.HR;
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = new this.userModel({ ...dto, password: hashed });
      return await user.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new BadRequestException('A user with this email already exists.');
      }
      throw new InternalServerErrorException('Failed to create HR user.');
    }
  }

  async createHMUser(dto: CreateUserDto): Promise<User> {
    dto.role = UserRole.HM;
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = new this.userModel({ ...dto, password: hashed });
      return await user.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new BadRequestException('A user with this email already exists.');
      }
      throw new InternalServerErrorException('Failed to create HM user.');
    }
  }

  /**
   * Find user by email.
   */
  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to find user by email.');
    }
  }

  /**
   * Return all users (admin usage).
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users.');
    }
  }

  /**
   * Return a single user by _id (admin or self).
   */
  async findOne(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format.');
      }
      throw new InternalServerErrorException('Failed to fetch user.');
    }
  }

  /**
   * Update a user by ID (admin usage).
   * e.g. admin might reset someone's password or rename user, etc.
   */
  async updateUserByAdmin(userId: string, dto: UpdateUserDto): Promise<User> {
    try {
      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
      }
      const user = await this.userModel
        .findByIdAndUpdate(userId, dto, { new: true })
        .exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new BadRequestException('A user with this email already exists.');
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format.');
      }
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  /**
   * Update own account (HR, HM or admin).
   * Only allow firstName, lastName, password changes.
   */
  async updateOwnAccount(userId: string, dto: UpdateUserDto): Promise<User> {
    try {
      const updateData: Partial<User> = {};
      if (dto.firstName) updateData.firstName = dto.firstName;
      if (dto.lastName) updateData.lastName = dto.lastName;
      if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 10);
      }

      const user = await this.userModel
        .findByIdAndUpdate(userId, updateData, { new: true })
        .exec();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new BadRequestException('A user with this email already exists.');
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format.');
      }
      throw new InternalServerErrorException('Failed to update account.');
    }
  }

  /**
   * Delete HR or HM's account by ID (admin usage).
   * The admin can remove HR and HM accounts, but cannot remove the admin itself.
   */
  async deleteUserByAdmin(userId: string): Promise<{ deleted: boolean }> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.role === UserRole.ADMIN) {
        throw new UnauthorizedException('Cannot delete the admin account');
      }

      const result = await this.userModel.findByIdAndDelete(userId).exec();
      return { deleted: !!result };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) throw error;
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format.');
      }
      throw new InternalServerErrorException('Failed to delete')
    }
  }
}