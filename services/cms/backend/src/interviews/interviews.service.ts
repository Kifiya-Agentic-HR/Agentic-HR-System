import { Injectable, Logger, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WinstonLoggerService } from '../common/winston-logger.service';
// ...

@Injectable()
export class InterviewService {
  private readonly baseUrl: string;
  private readonly logger = new WinstonLoggerService();

  constructor(private readonly httpService: HttpService) {
    // Make sure your environment variable INTERVIEW_BACKEND_URL is correctly set
    this.baseUrl = process.env.INTERVIEW_BACKEND_URL || 'http://interview_backend:8082/api/v1';
  }

  async schedule(applicationId: string) {
    this.logger.log(`Scheduling interview for application ID: ${applicationId}`);
    try {
      const payload = { application_id: applicationId };
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/interview/schedule`, payload),
      );
      this.logger.debug(`Schedule response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error scheduling interview: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to schedule this interview.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid application ID or request data.');
      }
      throw new InternalServerErrorException('Unable to schedule interview at this time. Please try again later.');
    }
  }

  async createSession(interviewId: string) {
    this.logger.log(`Creating session for interview ID: ${interviewId}`);
    try {
      const payload = { interview_id: interviewId };
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/interview/session/`, payload),
      );
      this.logger.debug(`Create session response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to create a session for this interview.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid interview ID or request data.');
      }
      throw new InternalServerErrorException('Unable to create interview session at this time. Please try again later.');
    }
  }

  async sendChat(sessionId: string, userAnswer: string) {
    this.logger.log(`Sending chat message for session ID: ${sessionId}`);
    try {
      const payload = { session_id: sessionId, user_answer: userAnswer };
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/interview/chat`, payload),
      );
      this.logger.debug(`Chat response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error processing chat: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to send a chat message for this session.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid session ID or user answer.');
      }
      throw new InternalServerErrorException('Unable to process chat message at this time. Please try again later.');
    }
  }

  async flagInterview(interviewId: string, violations: string) {
    this.logger.log(`Flagging interview ID: ${interviewId} with violations: ${violations}`);
    try {
      const payload = { interview_id: interviewId, violations };
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/interview/flag`, payload),
      );
      this.logger.debug(`Flag response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error flagging interview: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to flag this interview.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid interview ID or violations data.');
      }
      throw new InternalServerErrorException('Unable to flag interview at this time. Please try again later.');
    }
  }

  async getInterview(interviewId: string) {
    this.logger.log(`Fetching interview with ID: ${interviewId}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/interview/${interviewId}`),
      );
      this.logger.debug(`Get interview response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching interview: ${error.message}`, error.stack);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('You are not authorized to view this interview.');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Interview not found.');
      }
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid interview ID.');
      }
      throw new InternalServerErrorException('Unable to fetch interview at this time. Please try again later.');
    }
  }
}