import { Injectable, Logger, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }

  async createRecommendations(job_id: string) {
    this.logger.debug(`Calling POST ${this.baseUrl}/recommendation for job: ${job_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/recommendations`, null, {
          params: { job_id },
        }),
      );
      this.logger.debug(`Success response from createRecommendations()`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in createRecommendations()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to create recommendations.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Job not found for recommendations.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID for recommendations.');
      }
      throw new InternalServerErrorException('Error sending applications to screening service');
    }
  }

  async getRecommendationsByJobId(job_id: string) {
    this.logger.debug(`Calling GET ${this.baseUrl}/recommendations/${job_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/recommendations/${job_id}`),
      );
      this.logger.debug(`Success [getRecommendationsByJobId(${job_id})]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in getRecommendationsByJobId(${job_id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view recommendations.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Recommendations not found for this job.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID for recommendations.');
      }
      throw new InternalServerErrorException('Error retrieving recommended applications');
    }
  }
}