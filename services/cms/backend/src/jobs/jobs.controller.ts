import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('jobs')
@UseGuards(AuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  private extractUserId(req: any): string | null {
    return req?.user?.sub || null;
  }

  @Get()
  async findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
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
    const id = this.extractUserId(req);
    if (!id) {
      return { success: false, error: 'No id found in the token' };
    
    }
    return this.jobsService.create(jobData, id);}

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
