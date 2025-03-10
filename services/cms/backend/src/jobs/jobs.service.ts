import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JobsService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_PORTAL_PORT || 'http://localhost:9000';
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs`),
      );
      return response.data; // e.g. { success: true, jobs: [...] }
    } catch (error) {
      return { success: false, error: 'Error fetching jobs' };
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/${id}`),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error fetching job ${id}` };
    }
  }

  async create(jobData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/jobs`, jobData),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: 'Error creating job' };
    }
  }

  async update(id: string, jobData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/jobs/${id}`, jobData),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error updating job ${id}` };
    }
  }

  async remove(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/jobs/${id}`),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error deleting job ${id}` };
    }
  }

  async findApplicationsByJob(jobId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/${jobId}/applications`),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error fetching applications for job ${jobId}` };
    }
  }
}
