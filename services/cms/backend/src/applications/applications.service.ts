import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApplicationsService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_APPLICATION_PORT || 'http://localhost:9000';
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications`),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: 'Error fetching applications' };
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications/${id}`),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error fetching application ${id}` };
    }
  }

  async create(appData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/applications`, appData),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: 'Error creating application' };
    }
  }
}
