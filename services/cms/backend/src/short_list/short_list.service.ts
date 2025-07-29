import { Injectable, Logger, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShortListService {

  private readonly baseUrl: string;
  private readonly logger = new Logger(ShortListService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }
  
  async createShortList({job_id, hiring_manager_id}: { job_id: string; hiring_manager_id: string}) {
    this.logger.debug(
      `Calling post ${this.baseUrl}/short_list/${hiring_manager_id} from job: ${job_id}`
    );
    try {
      const payload = { job_id: job_id, hiring_manager_id};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/short_list/${hiring_manager_id}`, payload)
      );
      this.logger.debug(`Success [createShortList()]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in createShortList()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to create a short list.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Job or hiring manager not found for short list.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID or hiring manager ID for short list.');
      }
      throw new InternalServerErrorException('Error posting short list');
    }
  }

  async getRequests(hiring_manager_id: string) {
    this.logger.debug(
      `Calling get ${this.baseUrl}/short_list/${hiring_manager_id}`
    );
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/short_list/${hiring_manager_id}`)
      );
      this.logger.debug(`Success [getRequests(${hiring_manager_id})]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in getRequests(${hiring_manager_id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view short list requests.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Short list requests not found for this hiring manager.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid hiring manager ID.');
      }
      throw new InternalServerErrorException('Error getting short list requests');
    }
  }

  async deleteRequest(id: string, {job_id, hiring_manager_id}: { job_id: string; hiring_manager_id: string}) {
    this.logger.debug(
      `Calling DELETE ${this.baseUrl}/short_list with:
        shortlist_id: ${id},
        job_id: ${job_id},
        hiring_manager_id: ${hiring_manager_id}`
    );
  
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/short_list`, {
          params: {
            id,
            job_id: job_id,
            hiring_manager_id: hiring_manager_id,
          },
        })
      );
  
      this.logger.debug(`Success [deleteRequest()]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in deleteRequest()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to delete this short list request.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Short list request not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid short list request data.');
      }
      throw new InternalServerErrorException('Error deleting short list request');
    }
  }  

  async getShortListByJobId(job_id: string) {
    this.logger.debug(
      `Calling get ${this.baseUrl}/short_list/job/${job_id}`
    );
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/short_list/job/${job_id}`)
      );
      this.logger.debug(`Success [getShortListByJobId(${job_id})]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in getShortListByJobId(${job_id})`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view this short list.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Short list not found for this job.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid job ID.');
      }
     throw new InternalServerErrorException('Error getting short list by job id');
    }
  }
}