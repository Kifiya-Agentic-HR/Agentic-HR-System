import { Test, TestingModule } from '@nestjs/testing';
import { BulkService } from './bulk.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Readable } from 'stream';

describe('BulkService', () => {
  let service: BulkService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<BulkService>(BulkService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const zipMockFile = {
    originalname: 'test.zip',
    buffer: Buffer.from('zip-content'),
    mimetype: 'application/zip',
  } as Express.Multer.File;

  const jobMockFile = {
    originalname: 'job.xlsx',
    buffer: Buffer.from('excel-content'),
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  } as Express.Multer.File;

  describe('createBulkApplication', () => {
    it('should return response data on success with jobFile', async () => {
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
            headers: undefined
        },
      };

      mockHttpService.post.mockReturnValueOnce(of(mockResponse));

      const result = await service.createBulkApplication(
        { job_id: '123' },
        zipMockFile,
        jobMockFile,
        'hr-1'
      );

      expect(result).toEqual({ success: true });
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('should return error response if backend returns an error', async () => {
      const axiosError = {
        response: {
          data: { detail: 'Invalid job_id' },
        },
        isAxiosError: true,
      };

      mockHttpService.post.mockReturnValueOnce(throwError(() => axiosError));

      const result = await service.createBulkApplication(
        { job_id: 'invalid' },
        zipMockFile
      );

      expect(result).toEqual({ success: false, error: 'Invalid job_id' });
    });
  });

  describe('getBulkApplications', () => {
    it('should return data on success', async () => {
      const mockResponse: AxiosResponse = {
        data: [{ application: 'one' }],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
            headers: undefined
        },
      };

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      const result = await service.getBulkApplications('job-456');

      expect(result).toEqual([{ application: 'one' }]);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/job-456/applications')
      );
    });

    it('should return error on failure', async () => {
      const error = new Error('Failed to fetch');
      mockHttpService.get.mockReturnValueOnce(throwError(() => error));

      const result = await service.getBulkApplications('job-456');

      expect(result).toEqual({ success: false, error: 'Error fetching bulk applications' });
    });
  });
});
