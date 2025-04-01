import { Controller, Get, Post, Param, Body, UseGuards, Patch, Put, UseInterceptors, UploadedFile} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';


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

  @Post('')
  @Public()
  @UseInterceptors(FileInterceptor('cv'))
  async create(
    @UploadedFile() cv: Express.Multer.File,
    @Body() appData: any
  ) {
    return this.appsService.create(appData, cv);
  }
  
  @Patch(':id/reject')
  @Roles(UserRole.HR, UserRole.ADMIN)
  reject(@Param('id') id: string) {
    return this.appsService.reject(id);
  }

  @Patch(':id/accept')
  @Roles(UserRole.HR, UserRole.ADMIN)
  accept(@Param('id') id: string) {
    return this.appsService.accept(id);
  }

  @Put(':id')
  @Roles(UserRole.HM)
  update(@Param('id') id: string, @Body() updateData: any,) {
    return this.appsService.update(id, updateData);
  }

  @Put('edit_score/:id')
  @Roles(UserRole.HR)
  editScore(@Param('id') id: string, @Body() updateData: any,) {
    return this.appsService.editScore(id, updateData);
  }

}