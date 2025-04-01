import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { InterviewService } from './interviews.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('schedule')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.HR)
  async schedule(@Body() body: { application_id: string }) {
    return this.interviewService.schedule(body.application_id);
  }

  @Post('session')
  async createSession(@Body() body: { interview_id: string }) {
    return this.interviewService.createSession(body.interview_id);
  }

  @Post('chat')
  async chat(@Body() body: { session_id: string; user_answer: string }) {
    return this.interviewService.sendChat(body.session_id, body.user_answer);
  }

  @Post('flag')
  async flag(@Body() body: { interview_id: string; violations: string }) {
    return this.interviewService.flagInterview(body.interview_id, body.violations);
  }

  @Get(':interview_id')
  async getInterview(@Param('interview_id') interviewId: string) {
    return this.interviewService.getInterview(interviewId);
  }
}
