import { Controller, Get, Req, Post, Body, Param, UploadedFile, UseInterceptors, UseGuards, UploadedFiles, BadRequestException } from '@nestjs/common';
import { BulkService } from './bulk.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('bulk')
@UseGuards(AuthGuard, RolesGuard)
export class BulkController {
  constructor(private readonly bulkService: BulkService) {}

  private extractUserId(req: any): string | null {
    return req?.user?.sub || null;
  }
  
  @Post()
  @Roles(UserRole.HR)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'zipfolder', maxCount: 1 },
      { name: 'job_file', maxCount: 1 },
    ])
  )
  async createBulkApplication(
    @UploadedFiles() files: { zipfolder?: Express.Multer.File[]; job_file?: Express.Multer.File[] },
    @Body() jobInputs: { job_id?: string },
    @Req() req: any
  ) {
    const hr_id = this.extractUserId(req);
    const zipfolder = files?.zipfolder?.[0];
    const jobFile = files?.job_file?.[0];
  
    console.log("HR ID: ", hr_id);
    // Validate required files
    if (!zipfolder) {
      throw new BadRequestException('Zip folder is required');
    }
  
    // Validate job input source
    if (!jobInputs.job_id && !jobFile) {
      throw new BadRequestException(
        'Either job_id or job_file must be provided'
      );
    }

    console.log("Job Inputs: ", jobInputs);
  
    return this.bulkService.createBulkApplication(
      jobInputs,
      zipfolder,
      jobFile,
      hr_id // Pass the extracted hr_id to the service
    );
  }


  @Get(':job_id/applications')
  @Roles(UserRole.HR)
  async getBulkApplications(@Param('job_id') job_id: string) {
    return await this.bulkService.getBulkApplications(job_id);
  }
}