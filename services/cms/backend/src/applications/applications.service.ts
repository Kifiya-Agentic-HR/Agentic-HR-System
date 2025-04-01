import { Injectable, Logger} from '@nestjs/common';
import { HttpService} from '@nestjs/axios';
import { firstValueFrom} from 'rxjs';
import * as FormData from 'form-data';

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
      // this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data; 
    } catch (error) {
      this.logger.error(`Error fetching applications: ${error.message}`, error.stack);
      return { success: false, error: 'Error fetching applications' };
    }
  }

  async findOne(application_id: string) {
    this.logger.log(`Fetching application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications/${application_id}`),
      );
      // this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching application ${application_id}: ${error.message}`, error.stack);
      return { success: false, error: `Error fetching application ${application_id}` };
    }
  }

  async create(appData: any, cvFile: Express.Multer.File) {
    const form = new FormData();
    
    form.append('cv', cvFile.buffer, {
      filename: cvFile.originalname,
      contentType: cvFile.mimetype
    });
  
    Object.entries(appData).forEach(([key, value]) => {
      form.append(key, value.toString());
    });
  
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/applications`, form, {
          headers: {
            ...form.getHeaders(),
            'Accept': 'application/json'
          }
        })
      );
  
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {
        error: 'Application failed',
        details: 'No response from server'
      };
      
      this.logger.error(`Application Error: ${JSON.stringify(errorData)}`);
      
      return {
        success: false,
        ...errorData
      };
    }
  }

  async reject(application_id: string): Promise<any> {
    this.logger.log(`Rejecting application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/applications/${application_id}/reject`)
      );
      // this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data; 
    } catch (error) {
      this.logger.error(`Error rejecting application ${application_id}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error?.response?.data?.error || 'Error rejecting application',
      };
    }
  }

  async accept(application_id: string): Promise<any> {
    this.logger.log(`Accepting application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/applications/${application_id}/accept`)
      );
      // this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data; 
    } catch (error) {
      this.logger.error(`Error accepting application ${application_id}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error?.response?.data?.error || 'Error accepting application',
      };
    }
  }

  async editScore(application_id: string, updateData: any): Promise<any> {
    this.logger.log(`editing application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/applications/edit_score/${application_id}`, updateData)
      );
      // this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data; 
    } catch (error) {
      this.logger.error(`Error editing application ${application_id}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error?.response?.data?.error || 'Error editing application',
      };
    }
  }

  async update(application_id: string, updateData: any): Promise<any> {
    this.logger.log(`Updating application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/applications/${application_id}`, updateData)
      );
      // this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data; 
    } catch (error) {
      this.logger.error(`Error updating application ${application_id}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error?.response?.data?.error || 'Error updating application',
      };
    }
  }
}