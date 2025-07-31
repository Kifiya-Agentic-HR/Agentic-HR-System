import { Injectable, Logger, NotFoundException, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { WinstonLoggerService } from '../common/winston-logger.service';
// ...

@Injectable()
export class JobsService {
  private readonly logger = new WinstonLoggerService();
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching jobs`, error.stack); 
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view jobs.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Jobs not found.');
      }
      throw new InternalServerErrorException('Error fetching jobs');
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/${id}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in findOne(${id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view this job.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Job not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID.');
      }
      throw new InternalServerErrorException(`Error fetching job ${id}`);
    }
  }

  async getRequests(hiringManagerId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/short_list_request/${hiringManagerId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in getRequests(${hiringManagerId})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view short list requests.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Short list requests not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid hiring manager ID.');
      }
      throw new InternalServerErrorException('Error getting short list requests');
    }
  }

  async create(jobData: any, createdBy: string) {
    try {
      const payload = { ...jobData, created_by: createdBy};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/jobs/?hr_id=${createdBy}`, payload)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in create()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to create jobs.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job data.');
      }
      throw new InternalServerErrorException('Error creating job');
    }
  }
  
  async create_job_file(createdBy: string, job_file: Express.Multer.File) {
    try {
      const formData = new FormData();
      formData.append('job_file', job_file.buffer, {
        filename: job_file.originalname,
        contentType: job_file.mimetype,
      });
      formData.append('hr_id', createdBy);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/jobs/job_with_file/`, formData, {
          headers: formData.getHeaders(),
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in create_job_file()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to create jobs with file.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job file or data.');
      }
      throw new InternalServerErrorException('Error creating job');
    }
  }
  
  async update(id: string, jobData: any) {
    this.logger.debug(`Calling PATCH ${this.baseUrl}/jobs/${id} [update()] with data: ${JSON.stringify(jobData)}`);
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/jobs/${id}`, jobData),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in update(${id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to update this job.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Job not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID or update data.');
      }
      throw new InternalServerErrorException(`Error updating job ${id}`);
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
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to delete this job.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Job not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID.');
      }
      throw new InternalServerErrorException(`Error deleting job ${id}`);
    }
  }
  
  async findApplicationsByJob(jobId: string) {
    this.logger.debug(`Calling GET ${this.baseUrl}/jobs/${jobId}/applications [findApplicationsByJob()]`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/${jobId}/applications`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in findApplicationsByJob(${jobId})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view applications for this job.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Applications not found for this job.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID.');
      }
      throw new InternalServerErrorException(`Error fetching applications for job ${jobId}`);
    }
  }

  async shortList(hiringManagerId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/jobs/short_list/${hiringManagerId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in shortList(${hiringManagerId})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view short list.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Short list not found.');
      }
    }
  }
}