import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import * as FormData from 'form-data';
@Injectable()
export class JobsService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }

  async findAll() {
    try {
      this.logger.debug(`Calling GET ${this.baseUrl}/jobs/`); 
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/`),
      );
      // this.logger.debug(`Got response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching jobs`, error.stack); 
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error fetching jobs' };
    }
  }

  async findOne(id: string) {
    this.logger.debug(`Calling GET ${this.baseUrl}/jobs/${id} [findOne()]`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/${id}`),
      );
      // this.logger.debug(`Success [findOne(${id})]: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in findOne(${id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: `Error fetching job ${id}` };
    }
  }

  async getRequests(hiringManagerId: string) {
    this.logger.debug(
      `Calling get ${this.baseUrl}/jobs/short_list_request/${hiringManagerId}`
    );
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/short_list_request/${hiringManagerId}`)
      );
      // this.logger.debug(`Success [getRequests(${hiringManagerId})]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in getRequests(${hiringManagerId})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error getting short list requests' };
    }
  }

  async create(jobData: any, createdBy: string) {
    this.logger.debug(
      `Calling POST ${this.baseUrl}/jobs [create()] with data: ${JSON.stringify(jobData)} createdBy: ${createdBy}`
    );
    try {
      const payload = { ...jobData, created_by: createdBy};
  
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/jobs/?hr_id=${createdBy}`, payload)
      );
      // this.logger.debug(`Success [create()]: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in create()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error creating job' };
    }
  }
  
  async create_job_file(createdBy: string, job_file: Express.Multer.File) {
    // Log file details for debugging
    this.logger.debug(
      `Calling POST ${this.baseUrl}/jobs/job_with_file/ with file: ${job_file.originalname} createdBy: ${createdBy}`
    );
  
    try {
      const formData = new FormData();
      // Append the file as a stream or buffer:
      formData.append('job_file', job_file.buffer, {
        filename: job_file.originalname,
        contentType: job_file.mimetype,
      });
      // Append the hr_id value as required by the FastAPI endpoint:
      formData.append('hr_id', createdBy);
  
      // Make sure to include the multipart headers that FormData generates
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/jobs/job_with_file/`, formData, {
          headers: formData.getHeaders(),
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in create_job_file()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error creating job' };
    }
  }
  
  async update(id: string, jobData: any) {
    this.logger.debug(`Calling PATCH ${this.baseUrl}/jobs/${id} [update()] with data: ${JSON.stringify(jobData)}`);
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/jobs/${id}`, jobData),
      );
      // this.logger.debug(`Success [update(${id})]: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in update(${id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: `Error updating job ${id}` };
    }
  }

  async remove(id: string) {
    this.logger.debug(`Calling DELETE ${this.baseUrl}/jobs/${id} [remove()]`);
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/jobs/${id}`),
      );
      this.logger.debug(`Success [remove(${id})]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in remove(${id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: `Error deleting job ${id}` };
    }
  }
  
  async findApplicationsByJob(jobId: string) {
    this.logger.debug(`Calling GET ${this.baseUrl}/jobs/${jobId}/applications [findApplicationsByJob()]`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/${jobId}/applications`),
      );
      // this.logger.debug(`Success [findApplicationsByJob(${jobId})]: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in findApplicationsByJob(${jobId})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: `Error fetching applications for job ${jobId}` };
    }
  }

 // GET short list requests
 async shortList(hiringManagerId: string) {
  try {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/jobs/short_list/${hiringManagerId}`),
    );
    return response.data;
  } catch (error) {
    return { success: false, error: `Error fetching short list requests for hiring manager ${hiringManagerId}` };
  }
}
 
}