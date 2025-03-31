import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JobsService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }

  async findAll() {
    try {
      this.logger.debug(`Calling GET ${this.baseUrl}/jobs`); 
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs`),
      );
      this.logger.debug(`Got response: ${JSON.stringify(response.data)}`);
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
      this.logger.debug(`Success [findOne(${id})]: ${JSON.stringify(response.data)}`);
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
      this.logger.debug(`Success [getRequests(${hiringManagerId})]`);
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
      this.logger.debug(`Success [create()]: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in create()`, error.stack);
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
      this.logger.debug(`Success [update(${id})]: ${JSON.stringify(response.data)}`);
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
      this.logger.debug(`Success [findApplicationsByJob(${jobId})]: ${JSON.stringify(response.data)}`);
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

async getshortList(jobId: string) {
  try {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/jobs/short_list/job/${jobId}`),
    );
    return response.data;
  } catch (error) {
    return { success: false, error: `Error fetching short list requests for hiring manager ${jobId}` };
  }
}
 


  // POST create short list request
  async createShortList(hiringManagerId: string, jobId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/jobs/short_list/${hiringManagerId}?job_id=${jobId}`,
        {} ),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error creating short list request for hiring manager ${hiringManagerId}` };
    }
  }

  // DELETE short list request
  async deleteShortList(hiringManagerId: string, jobId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/jobs/short_list`, {
          params: { hiring_manager_id: hiringManagerId, job_id: jobId },
        }),
      );
      return response.data;
    } catch (error) {
      return { success: false, error: `Error deleting short list request for hiring manager ${hiringManagerId} and job ${jobId}` };
    }
  }

}