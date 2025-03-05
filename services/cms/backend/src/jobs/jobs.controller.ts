import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('jobs')
@UseGuards(AuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // GET /jobs
  @Get()
  async findAll() {
    return this.jobsService.findAll();
  }

  // GET /jobs/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // GET /jobs/:id/applications
  @Get(':id/applications')
  async findApplicationsByJob(@Param('id') id: string) {
    return this.jobsService.findApplicationsByJob(id);
  }

  // POST /jobs => Only HR can create
  @Post()
  @Roles(UserRole.HR)
  async create(@Body() jobData: any) {
    return this.jobsService.create(jobData);
  }

  // PUT /jobs/:id => Only HR can update
  @Put(':id')
  @Roles(UserRole.HR)
  async update(@Param('id') id: string, @Body() jobData: any) {
    return this.jobsService.update(id, jobData);
  }

  // DELETE /jobs/:id => Only HR can delete
  @Delete(':id')
  @Roles(UserRole.HR)
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
