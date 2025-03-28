import { Controller, Get, Post, Param, Delete, UseGuards, Req, Query} from '@nestjs/common';
import { ShortListService } from './short_list.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('short-list')
@UseGuards(AuthGuard, RolesGuard)
export class ShortListController {
  constructor(private readonly shortListService: ShortListService) {}

  @Get(':hiring_manager_id')
  @Roles(UserRole.HR)
  async getRequests(@Param('hiring_manager_id') hiring_manager_id: string) {
    if (!hiring_manager_id) {
      return { success: false, error: 'No hm id found' };
    }
    return this.shortListService.getRequests(hiring_manager_id )
  }

  @Post(':hiring_manager_id')
  @Roles(UserRole.HR)
  async createShortList(@Param('hiring_manager_id') hiring_manager_id: string, @Query('job_id') job_id: string) {
    if (!job_id || !hiring_manager_id) {
      return { success: false, error: 'Missing hr_manager_id or job_id' };
    }
    return this.shortListService.createShortList({job_id, hiring_manager_id});
  }

  @Delete(':id')
  @Roles(UserRole.HR)
  async deleteRequest(@Param('id') id: string, @Query('hiring_manager_id') hiring_manager_id: string,
  @Query('job_id') job_id: string,) {    
  if (!id || !job_id || !hiring_manager_id) {
    return {
      success: false,
      error: 'Missing one or more required parameters',
    };
  }
    
  return this.shortListService.deleteRequest(id, {job_id, hiring_manager_id});
  }
}
