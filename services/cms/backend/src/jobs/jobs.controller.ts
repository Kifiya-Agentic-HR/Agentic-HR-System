import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('jobs')
@UseGuards(AuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

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

  @Get('short_list_request/:hr_manager_id')
  @Roles(UserRole.HR)
  async getRequests(@Req() req: any) {
    const hr_manager_id = req.user.sub;
    if (!hr_manager_id) {
      return { success: false, error: 'No hm id found in the token' };
    }
    return this.jobsService.getRequests(hr_manager_id );}

  @Post()
  @Roles(UserRole.HR)
  async create(@Body() jobData: any, @Req() req: any) {
    const id = req.user.sub;
    if (!id) {
      return { success: false, error: 'No id found in the token' };
    
    }
    return this.jobsService.create(jobData, id );}
  
  @Post('short_list_request/:hr_manager_id')
  @Roles(UserRole.HR)
  async createShortList(@Param('id') id: string, @Req() req: any) {
    const hr_manager_id = req.user.sub;
    if (!hr_manager_id) {
      return { success: false, error: 'No hm id found in the token' };
    }
    return this.jobsService.createShortList(id, hr_manager_id );}

  @Put(':id')
  @Roles(UserRole.HR)
  async update(@Param('id') id: string, @Body() jobData: any) {
    return this.jobsService.update(id, jobData);
  }

  @Delete(':id')
  @Roles(UserRole.HR)
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  @Delete('short_list_request')
  @Roles(UserRole.HR)
  async deleteRequest(@Param('id') id: string, @Req() req: any) {
    const hr_manager_id = req.user.sub;
    if (!hr_manager_id) {
      return { success: false, error: 'No hm id found in the token' };
    }
    return this.jobsService.deleteRequest(id, hr_manager_id );}
}
