import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Query ,UploadedFile,UseInterceptors} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('jobs')
// @UseGuards(AuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  private extractUserId(req: any): string | null {
    return req?.user?.sub || null;
  }

 
  @Get("")
  @Public()
  async findAll() {
    return this.jobsService.findAll();
  }

 
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Get(':id/applications')
  async findApplicationsByJob(@Param('id') id: string) {
    return this.jobsService.findApplicationsByJob(id);
  }

  @Post()
  @Roles(UserRole.HR)
  async create(@Body() jobData: any, @Req() req: any) {
    const id = 'this.extractUserId(req);'
    if (!id) {
      return { success: false, error: 'No id found in the token' };
    
    }
    return this.jobsService.create(jobData, id);}
  @Post('/job_with_file')
  @UseInterceptors(FileInterceptor('job_file'))
  async create_job_file(
    @UploadedFile() job_file: Express.Multer.File,
    @Body() body: any, // if you need additional fields
    @Req() req: any
  ) {
    const id = '2222'; // or extract from token / req
    console.log("id", id);
    if (!id) {
      return { success: false, error: 'No id found in the token' };
    }
    // You might also want to merge any additional form fields from the body if needed.
    return this.jobsService.create_job_file(id, job_file);
  }

  @Patch(':id')
  @Roles(UserRole.HR)
  async update(@Param('id') id: string, @Body() jobData: any) {
    return this.jobsService.update(id, jobData);
  }

  @Delete(':id')
  @Roles(UserRole.HR)
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);

  }
}
