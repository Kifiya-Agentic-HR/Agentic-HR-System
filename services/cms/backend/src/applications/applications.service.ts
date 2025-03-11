import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApplicationsService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }

  async findAll() {
    this.logger.log(`Fetching all applications from: ${this.baseUrl}/applications`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications`),
      );
      this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data; 
    } catch (error) {
      this.logger.error(`Error fetching applications: ${error.message}`, error.stack);
      return { success: false, error: 'Error fetching applications' };
    }
  }

  async findOne(id: string) {
    this.logger.log(`Fetching application with ID: ${id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications/${id}`),
      );
      this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching application ${id}: ${error.message}`, error.stack);
      return { success: false, error: `Error fetching application ${id}` };
    }
  }

  async create(appData: any) {
    this.logger.log(`Creating new application with data: ${JSON.stringify(appData)}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/applications`, appData),
      );
      this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating application: ${error.message}`, error.stack);
      return { success: false, error: 'Error creating application' };
    }
  }
}