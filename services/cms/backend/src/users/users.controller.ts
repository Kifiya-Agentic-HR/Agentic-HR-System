import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Delete, Put, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Admin creates HR accounts.
   * Must pass { email, password, role: 'hr', ... } in body.
   */
  @Post('hr')
  @Roles(UserRole.ADMIN)
  createHR(@Body() dto: CreateUserDto) {
    return this.usersService.createHRUser(dto);
  }

  /**
   * Admin can list all users.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Admin can update any user by ID.
   * e.g. reset password, rename user, etc.
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  updateAnyUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUserByAdmin(id, dto);
  }

  /**
   * HR (or admin) can read their own profile.
   * 'req.user.sub' is the userId from JWT.
   */
  @Get(':id')
  @Roles(UserRole.HR, UserRole.ADMIN)
  getUser(@Param('id') id: string, @Req() req) {
    // If the user is HR, ensure the requested :id matches their own
    if (req.user.role === UserRole.HR && req.user.sub !== id) {
      throw new ForbiddenException('HR can only retrieve their own record.');
    }
    return this.usersService.findOne(id);
  }

  /**
   * HR (or admin) can update their own password, first/last name
   */
  @Patch(':id/self')
  @Roles(UserRole.HR, UserRole.ADMIN)
  updateSelf(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req) {
    if (req.user.role === UserRole.HR && req.user.sub !== id) {
      throw new ForbiddenException('HR can only update their own account.');
    }
    return this.usersService.updateOwnAccount(id, dto);
  }


  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeUser(@Param('id') id: string) {
    return this.usersService.deleteUserByAdmin(id);
  }

}
