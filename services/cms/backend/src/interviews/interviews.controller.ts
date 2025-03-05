import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InterviewService } from './interviews.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('interview')
@UseGuards(AuthGuard, RolesGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('schedule')
  @Roles(UserRole.HR)
  async schedule(@Body() body: { application_id: string }) {
    return this.interviewService.schedule(body.application_id);
  }
}
