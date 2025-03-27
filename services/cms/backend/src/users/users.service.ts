import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
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
    // Force the role to 'admin'
    dto.role = UserRole.ADMIN;

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashed });
    return user.save();
  }

  /**
   * Create an HR user. Only the admin can call this (controller enforces).
   */
  async createHRUser(dto: CreateUserDto): Promise<User> {
    // Force the role to 'hr'
    dto.role = UserRole.HR;

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashed });
    return user.save();
  }

  async createHMUser(dto: CreateUserDto): Promise<User> {
    // Force the role to 'hm'
    dto.role = UserRole.HM;

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashed });
    return user.save();
  }

  /**
   * Find user by email.
   */
  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Return all users (admin usage).
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Return a single user by _id (admin or self).
   */
  async findOne(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update a user by ID (admin usage).
   * e.g. admin might reset someone's password or rename user, etc.
   */
  async updateUserByAdmin(userId: string, dto: UpdateUserDto): Promise<User> {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update own account (HR, HM or admin).
   * Only allow firstName, lastName, password changes.
   */
  async updateOwnAccount(userId: string, dto: UpdateUserDto): Promise<User> {
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
  }

  /**
   * Delete HR or HM's account by ID (admin usage).
   * The admin can remove HR and HM accounts, but cannot remove the admin itself.
   */
  async deleteUserByAdmin(userId: string): Promise<{ deleted: boolean }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === UserRole.ADMIN) {
      throw new UnauthorizedException('Cannot delete the admin account');
    }

    const result = await this.userModel.findByIdAndDelete(userId).exec();
    return { deleted: !!result };
  }
}
