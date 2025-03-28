import { Controller, Get, Post, Param, Delete, UseGuards, Req} from '@nestjs/common';
import { ShortListService } from './short_list.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('short-list')
@UseGuards(AuthGuard, RolesGuard)
export class ShortListController {
  constructor(private readonly shortListService: ShortListService) {}

  private extractUserId(req: any): string | null {
    return req?.user?.sub || null;
  }

  @Get(':hr_manager_id')
  @Roles(UserRole.HR)
  async getRequests(@Param('hr_manager_id') hr_manager_id: string) {
    if (!hr_manager_id) {
      return { success: false, error: 'No hm id found' };
    }
    return this.shortListService.getRequests(hr_manager_id );}

  @Post(':hiring_manager_id')
  @Roles(UserRole.HR)
  async createShortList(@Param('hiring_manager_id') hiringManagerId: string, @Req() req: any) {
    const hrId = this.extractUserId(req);
    if (!hrId) {
      return { success: false, error: 'No hr id found in the token' };
    }
    return this.shortListService.createShortList(hrId, hiringManagerId);}

  @Delete(':id')
  @Roles(UserRole.HR)
  async deleteRequest(@Param('id') id: string, @Req() req: any) {
    const hrManagerId = this.extractUserId(req);
    if (!hrManagerId) {
      return { success: false, error: 'No hr_manager_id found in the token' };
    }
    return this.shortListService.deleteRequest(id, hrManagerId);
  }
}
