import { Injectable, Logger, HttpException, HttpStatus, NotFoundException, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { HttpService} from '@nestjs/axios';
import { firstValueFrom} from 'rxjs';
import * as FormData from 'form-data';
import { ApplicationInvitePayload } from '../applications/interfaces/application-invite-payload.interface';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class ApplicationsService {
  private readonly baseUrl: string;
  private readonly notificationUrl: string;
  private readonly logger = new Logger(ApplicationsService.name);
  private readonly jobUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jobService: JobsService,

  ) {
    this.baseUrl = process.env.JOB_SERVICE_URL || 'http://job_service_backend:9000';
    this.notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service/';
    this.jobUrl = process.env.CAREERS_PAGE || 'http://18.206.154.72:8086/'
  }

  async findAll() {
    this.logger.log(`Fetching all applications from: ${this.baseUrl}/applications`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications`),
      );
      return response.data; 
    } catch (error) {
      this.logger.error(`Error fetching applications: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view applications.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Applications not found.');
      }
      throw new InternalServerErrorException('Error fetching applications');
    }
  }

  async findOne(application_id: string) {
    this.logger.log(`Fetching application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/applications/${application_id}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching application ${application_id}: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view this application.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Application not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid application ID.');
      }
      throw new InternalServerErrorException(`Error fetching application ${application_id}`);
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
      if (error.response?.status === 400) {
        throw new BadRequestException(errorData.error || 'Invalid application data.');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to create an application.');
      }
      throw new InternalServerErrorException(errorData.error || 'Failed to create application.');
    }
  }

  async reject(application_id: string): Promise<any> {
    this.logger.log(`Rejecting application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/applications/${application_id}/reject`)
      );
      return response.data; 
    } catch (error) {
      this.logger.error(`Error rejecting application ${application_id}: ${error.message}`, error.stack);
      if (error.response?.status === 404) {
        throw new NotFoundException('Application not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid application ID.');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to reject this application.');
      }
      throw new InternalServerErrorException('Error rejecting application');
    }
  }

  async accept(application_id: string): Promise<any> {
    this.logger.log(`Accepting application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/applications/${application_id}/accept`)
      );
      return response.data; 
    } catch (error) {
      this.logger.error(`Error accepting application ${application_id}: ${error.message}`, error.stack);
      if (error.response?.status === 404) {
        throw new NotFoundException('Application not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid application ID.');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to accept this application.');
      }
      throw new InternalServerErrorException('Error accepting application');
    }
  }

  async editScore(application_id: string, updateData: any): Promise<any> {
    this.logger.log(`editing application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/applications/edit_score/${application_id}`, updateData)
      );
      return response.data; 
    } catch (error) {
      this.logger.error(`Error editing application ${application_id}: ${error.message}`, error.stack);
      if (error.response?.status === 404) {
        throw new NotFoundException('Application not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid application ID or score data.');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to edit this application.');
      }
      throw new InternalServerErrorException('Error editing application');
    }
  }

  async update(application_id: string, updateData: any): Promise<any> {
    this.logger.log(`Updating application with ID: ${application_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/applications/${application_id}`, updateData)
      );
      return response.data; 
    } catch (error) {
      this.logger.error(`Error updating application ${application_id}: ${error.message}`, error.stack);
      if (error.response?.status === 404) {
        throw new NotFoundException('Application not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid application ID or update data.');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to update this application.');
      }
      throw new InternalServerErrorException('Error updating application');
    }
  }

  async invite(payload: ApplicationInvitePayload): Promise<any> {
    let job = await this.jobService.findOne(payload.apply_link);
    let title = job?.job ? job.job.title : "the job";
    const subject =  `We would like to invite you to apply to ${title} at Kifiya Financial Technologies`;

    const requestPayload = {
      to: payload.to,
      title: title,
      type: 'application_invite',
      subject,
      name: payload.name,
      apply_link: `${this.jobUrl}/jobs/${payload.apply_link}/apply`,
    };

    this.logger.log(`Sending application invite to ${payload.to} via ${this.notificationUrl}notify/email`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationUrl}notify/email`, requestPayload),
      );
      this.logger.log(`Invitation sent successfully to ${payload.to}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error sending invitation: ${error.message}`, error.stack);
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid invitation data.');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to send invitations.');
      }
      throw new InternalServerErrorException(
        'Failed to send application invitation via notification service. ' +
          (error.response?.data?.detail || error.message),
      );
    }
  }
}