import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InterviewService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.INTERVIEW_BACKEND_PORT || 'http://localhost:8080';
  }

  async schedule(applicationId: string) {
    try {
      const payload = { application_id: applicationId };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/schedule`, payload),
      );

      return response.data;
    } catch (error) {
      return { success: false, error: 'Error scheduling interview' };
    }
  }
}
