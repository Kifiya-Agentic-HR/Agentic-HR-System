import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, UseGuards, UploadedFiles, BadRequestException } from '@nestjs/common';
import { BulkService } from './bulk.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('bulk')
@UseGuards(AuthGuard, RolesGuard)
export class BulkController {
  constructor(private readonly bulkService: BulkService) {}

  @Post("/")
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
  ) {
    const zipfolder = files.zipfolder?.[0];
    const jobFile = files.job_file?.[0];

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

    return this.bulkService.createBulkApplication(jobInputs, zipfolder, jobFile);
  }


  @Get(':job_id/applications')
  @Roles(UserRole.HR)
  async getBulkApplications(@Param('job_id') job_id: string) {
    return await this.bulkService.getBulkApplications(job_id);
  }
}