import { Injectable, Logger } from '@nestjs/common';
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
      
      console.log(`Response from post recommendation service:`, response.data);
      this.logger.debug(`Success response from createRecommendations()`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in createRecommendations()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error sending applications to screening service' };
    }
  }

  async getRecommendationsByJobId(job_id: string) {
    this.logger.debug(`Calling GET ${this.baseUrl}/recommendations/${job_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/recommendations/${job_id}`),
      );
      console.log('Response from get recommendation service:', response.data);
      console.log(response.data);

      this.logger.debug(`Success [getRecommendationsByJobId(${job_id})]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in getRecommendationsByJobId(${job_id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error retrieving recommended applications' };
    }
  }
}
