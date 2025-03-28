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

  @Get('short_list_request/:hr_manager_id')
  @Roles(UserRole.HR)
  async getRequests(@Param('hr_manager_id') hr_manager_id: string) {
    if (!hr_manager_id) {
      return { success: false, error: 'No hm id found' };
    }
    return this.jobsService.getRequests(hr_manager_id );}

  @Post()
  @Roles(UserRole.HR)
  async create(@Body() jobData: any, @Req() req: any) {
    const id = this.extractUserId(req);
    if (!id) {
      return { success: false, error: 'No id found in the token' };
    
    }
    return this.jobsService.create(jobData, id);}
  
  @Post('short_list_request/:hiring_manager_id')
  @Roles(UserRole.HR)
  async createShortList(@Param('hiring_manager_id') hiringManagerId: string, @Req() req: any) {
    const hrId = this.extractUserId(req);
    if (!hrId) {
      return { success: false, error: 'No hr id found in the token' };
    }
    return this.jobsService.createShortList(hrId, hiringManagerId);}

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

  @Delete('short_list_request/:id')
  @Roles(UserRole.HR)
  async deleteRequest(@Param('id') id: string, @Req() req: any) {
    const hrManagerId = this.extractUserId(req);
    if (!hrManagerId) {
      return { success: false, error: 'No hr_manager_id found in the token' };
    }
    return this.jobsService.deleteRequest(id, hrManagerId);
  }
}
