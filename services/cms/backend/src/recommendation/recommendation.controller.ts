import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('recommendations')
// @UseGuards(AuthGuard, RolesGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('/')
  // @Roles(UserRole.HR)
  async createRecommendations(@Body('job_id') job_id: string) {
    if (!job_id) {
      return { success: false, error: 'Job ID is required' };
    }
    console.log("we are in controller ----------------------------------------------");
    const result = await this.recommendationService.createRecommendations(job_id);
    console.log('Response from post recommendation service:', result);
    return result;
  }
  @Get('/:job_id')
  // @Roles(UserRole.HR, UserRole.HM)
  async getRecommendationsByJobId(@Param('job_id') job_id: string) {
    if (!job_id) {
      return { success: false, error: 'Job ID is required' };
    }
    return this.recommendationService.getRecommendationsByJobId(job_id);
  }
}
