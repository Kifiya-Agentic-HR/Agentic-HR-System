import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Delete } from '@nestjs/common';
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
   * Admin creates accounts.
   */
  @Post('hr')
  @Roles(UserRole.ADMIN)
  createHR(@Body() dto: CreateUserDto) {
    return this.usersService.createHRUser(dto);
  }

  @Post('hm')
  @Roles(UserRole.ADMIN)
  createHM(@Body() dto: CreateUserDto) {
    return this.usersService.createHMUser(dto);
  }

  /**
   * Admin can list all users.
   */
  @Get()
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
   * users can read their own profile.
   * 'req.user.sub' is the userId from JWT.
   */
  @Get('me')
  @Roles(UserRole.HR,UserRole.HM, UserRole.ADMIN)
  getMe(@Req() req) {
    return this.usersService.findOne(req.user.sub);
  }

  @Get("me/name") // for convenience, return the full name of the current user')
  @Roles(UserRole.HR, UserRole.HM)
  async me(@Req() req: any) {
  let currentUser = req?.user?.sub || "Guest";
      if (currentUser !== "Guest") {
        console.debug("Current user ID: ", currentUser);
        currentUser = await this.usersService.findOne(currentUser);
        console.debug("Current user: ", currentUser);
        currentUser = currentUser.firstName + " " + currentUser.lastName;
      }
      return {"name": currentUser}
  }

  /**
   * users can update their own password, first/last name, etc.
   */
  @Patch('me')
  @Roles(UserRole.HR, UserRole.HM, UserRole.ADMIN)
  updateMe(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateOwnAccount(req.user.sub, dto);
  }


  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeUser(@Param('id') id: string) {
    return this.usersService.deleteUserByAdmin(id);
  }

}
