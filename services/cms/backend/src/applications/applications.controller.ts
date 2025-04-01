import { Controller, Get, Post, Param, Body, UseGuards, Patch, Put, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('applications')
@UseGuards(AuthGuard, RolesGuard)
export class ApplicationsController {
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(private readonly appsService: ApplicationsService) {}

  @Get()
  @Roles(UserRole.HR, UserRole.ADMIN)
  async findAll() {
    this.logger.log('Fetching all applications');
    return this.appsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.HR, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching application with ID: ${id}`);
    return this.appsService.findOne(id);
  }

  @Post('')
  @Public()
  @UseInterceptors(FileInterceptor('cv'))
  async create(
    @UploadedFile() cv: Express.Multer.File,
    @Body() appData: any
  ) {
    this.logger.log(`Creating application with data: ${JSON.stringify(appData)}`);
    return this.appsService.create(appData, cv);
  }
  
  @Patch(':id/reject')
  @Roles(UserRole.HR, UserRole.ADMIN)
  reject(@Param('id') id: string) {
    this.logger.warn(`Rejecting application with ID: ${id}`);
    return this.appsService.reject(id);
  }

  @Patch(':id/accept')
  @Roles(UserRole.HR, UserRole.ADMIN)
  accept(@Param('id') id: string) {
    this.logger.log(`Accepting application with ID: ${id}`);
    return this.appsService.accept(id);
  }

  @Put(':id')
  @Roles(UserRole.HM, UserRole.HR)
  update(@Param('id') id: string, @Body() updateData: any) {
    this.logger.log(`Updating application with ID: ${id}, Data: ${JSON.stringify(updateData)}`);
    return this.appsService.update(id, updateData);
  }

  @Put('edit_score/:id')
  @Roles(UserRole.HR)
  editScore(@Param('id') id: string, @Body() updateData: any) {
    this.logger.log(`Editing score for application ID: ${id}, Data: ${JSON.stringify(updateData)}`);
    return this.appsService.editScore(id, updateData);
  }
}
