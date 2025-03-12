import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InterviewService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(InterviewService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.INTERVIEW_BACKEND_URL || 'http://interview_backend:8080/api/v1/';
  }

  async schedule(applicationId: string) {
    this.logger.log(`Scheduling interview for application ID: ${applicationId}`);
    try {
      const payload = { application_id: applicationId };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/interview/schedule`, payload),
      );

      this.logger.debug(`Interview schedule response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error scheduling interview: ${error.message}`, error.stack);
      return { success: false, error: 'Error scheduling interview' };
    }
  }
}