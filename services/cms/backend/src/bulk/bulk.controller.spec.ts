import { Test, TestingModule } from '@nestjs/testing';
import { BulkController } from './bulk.controller';
import { BulkService } from './bulk.service';
import { BadRequestException } from '@nestjs/common';

describe('BulkController', () => {
  let controller: BulkController;
  let bulkService: Partial<BulkService>;

  const mockBulkApplication = { message: 'Bulk applications created' };
  const mockGetApplications = [{ id: 1 }, { id: 2 }];

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    bulkService = {
      createBulkApplication: jest.fn().mockResolvedValue(mockBulkApplication),
      getBulkApplications: jest.fn().mockResolvedValue(mockGetApplications),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkController],
      providers: [{ provide: BulkService, useValue: bulkService }],
    })
      .overrideGuard(require('../auth/guards/auth.guard').AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(require('../auth/guards/roles.guard').RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BulkController>(BulkController);
  });

  describe('createBulkApplication', () => {
    const req = { user: { sub: 'hr123' } };

    it('should create bulk application with job_id and zip', async () => {
      const files = {
        zipfolder: [{ originalname: 'cvs.zip' }] as any,
        job_file: undefined,
      };
      const jobInputs = { job_id: 'job456' };

      const result = await controller.createBulkApplication(files, jobInputs, req);

      expect(result).toEqual(mockBulkApplication);
      expect(bulkService.createBulkApplication).toHaveBeenCalledWith(
        jobInputs,
        files.zipfolder[0],
        undefined,
        'hr123'
      );
    });

    it('should create bulk application with job_file and zip', async () => {
      const files = {
        zipfolder: [{ originalname: 'cvs.zip' }] as any,
        job_file: [{ originalname: 'job.csv' }] as any,
      };
      const jobInputs = {};

      const result = await controller.createBulkApplication(files, jobInputs, req);

      expect(result).toEqual(mockBulkApplication);
      expect(bulkService.createBulkApplication).toHaveBeenCalledWith(
        jobInputs,
        files.zipfolder[0],
        files.job_file[0],
        'hr123'
      );
    });

    it('should throw error if zipfolder is missing', async () => {
      const files = {
        zipfolder: undefined,
        job_file: [{ originalname: 'job.csv' }] as any,
      };
      const jobInputs = { job_id: 'job456' };

      await expect(controller.createBulkApplication(files, jobInputs, req))
        .rejects
        .toThrow(new BadRequestException('Zip folder is required'));
    });

    it('should throw error if both job_id and job_file are missing', async () => {
      const files = {
        zipfolder: [{ originalname: 'cvs.zip' }] as any,
        job_file: undefined,
      };
      const jobInputs = {};

      await expect(controller.createBulkApplication(files, jobInputs, req))
        .rejects
        .toThrow(
          new BadRequestException('Either job_id or job_file must be provided')
        );
    });
  });

  describe('getBulkApplications', () => {
    it('should return applications for given job_id', async () => {
      const result = await controller.getBulkApplications('job456');
      expect(result).toEqual(mockGetApplications);
      expect(bulkService.getBulkApplications).toHaveBeenCalledWith('job456');
    });
  });
});
