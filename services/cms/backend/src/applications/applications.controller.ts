import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('applications')
@UseGuards(AuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly appsService: ApplicationsService) {}

  @Get()
  @Roles(UserRole.HR, UserRole.ADMIN)
  async findAll() {
    return this.appsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.HR, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.appsService.findOne(id);
  }

  @Post()
  async create(@Body() appData: any) {
    return this.appsService.create(appData);
  }
}
