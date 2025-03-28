import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShortListService {

  private readonly baseUrl: string;
  private readonly logger = new Logger(ShortListService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
  }
  
  async createShortList(id: string, hiringManagerId: string) {
      this.logger.debug(
        `Calling post ${this.baseUrl}/jobs/short_list_request/${hiringManagerId} from job: ${id}`
      );
      try {
        const payload = { id, hiringManagerId};
        const response = await firstValueFrom(
          this.httpService.post(`${this.baseUrl}/jobs/short_list_request/${hiringManagerId}`, payload)
        );
        this.logger.debug(`Success [createShortList()]`);
        return response.data;
      } catch (error) {
        this.logger.error(`Error in createShortList()`, error.stack);
        this.logger.error(error?.response?.data || error?.message);
        return { success: false, error: 'Error posting short list' };
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

  async deleteRequest(id: string, hrManagerId: string) {
    this.logger.debug(
      `Calling DELETE ${this.baseUrl}/jobs/short_list_request with hr_manager_id: ${hrManagerId} and job id: ${id}`
    );
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/jobs/short_list_request`, {
          params: { hrManagerId, id },
        })
      );
      this.logger.debug(`Success [deleteRequest]`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error in deleteRequest()`, error.stack);
      this.logger.error(error?.response?.data || error?.message);
      return { success: false, error: 'Error deleting short list request' };
    }
  }

  
}
