import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JobsService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // e.g. "http://localhost:9000" from .env
    this.baseUrl = process.env.JOBS_MICROSERVICE_URL || 'http://localhost:9000';
  }

  /**
   * GET /jobs
   */
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

  /**
   * GET /jobs/:id
   */
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

  /**
   * POST /jobs
   */
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

  /**
   * PUT /jobs/:id 
   */
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

  /**
   * DELETE /jobs/:id
   */
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

  /**
   * GET /jobs/:id/applications
   */
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
