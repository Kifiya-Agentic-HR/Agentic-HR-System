import { Injectable, Logger} from '@nestjs/common';
import { HttpService} from '@nestjs/axios';
import { firstValueFrom} from 'rxjs';
import FormData from 'form-data';
import { File as MulterFile } from 'multer';

@Injectable()
export class BulkService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(BulkService.name);

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.BULK_SERVICE_URL || 'http://job_service_backend:9000';
  }

  async createBulkApplication(
    jobInputs: { job_id?: string },
    zipfolder: MulterFile,
    jobFile?: MulterFile,
  ) {
    this.logger.log(`Creating bulk application. jobInputs: ${JSON.stringify(jobInputs)}`);

    try {
      const formData = new FormData();

      if (jobInputs.job_id) {
        formData.append('job_id', jobInputs.job_id);
      }

      if (jobFile) {
        formData.append('job_file', jobFile.buffer, {
          filename: jobFile.originalname,
          contentType: jobFile.mimetype,
        });
      }

      formData.append('zipfolder', zipfolder.buffer, {
        filename: zipfolder.originalname,
        contentType: zipfolder.mimetype,
      });

      const headers = formData.getHeaders();
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/`, formData, { headers }),
      );
      this.logger.debug(`Bulk application response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating bulk application: ${error.message}`, error.stack);
      return { success: false, error: 'Error creating bulk application' };
    }
  }

  async getBulkApplications(job_id: string) {
    this.logger.log(`Fetching bulk applications for job ID: ${job_id}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${job_id}/applications`)
      );
      this.logger.debug(`Received data: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching bulk applications: ${error.message}`, error.stack);
      return { success: false, error: 'Error fetching bulk applications' };
    }
  }
}