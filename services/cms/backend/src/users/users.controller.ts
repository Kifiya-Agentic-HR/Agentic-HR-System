import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
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
  @Get('me')
  @Roles(UserRole.HR, UserRole.ADMIN)
  getMe(@Req() req) {
    return this.usersService.findOne(req.user.sub);
  }

  /**
   * HR (or admin) can update their own password, first/last name, etc.
   */
  @Patch('me')
  @Roles(UserRole.HR, UserRole.ADMIN)
  updateMe(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateOwnAccount(req.user.sub, dto);
  }


  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeUser(@Param('id') id: string) {
    return this.usersService.deleteUserByAdmin(id);
  }

}
