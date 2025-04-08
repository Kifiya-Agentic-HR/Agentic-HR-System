import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

describe('JobsService', () => {
  let service: JobsService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockSuccess = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: undefined
    },
  });

  const mockError = (message = 'fail') =>
    throwError(() => ({
      response: { data: { message } },
      message,
      stack: 'mock-stack',
    }));

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return jobs on success', async () => {
      const data = [{ id: '1' }];
      mockHttpService.get.mockReturnValueOnce(of(mockSuccess(data)));

      const result = await service.findAll();
      expect(result).toEqual(data);
    });

    it('should handle error', async () => {
      mockHttpService.get.mockReturnValueOnce(mockError('jobs error'));

      const result = await service.findAll();
      expect(result).toEqual({ success: false, error: 'Error fetching jobs' });
    });
  });

  describe('findOne', () => {
    it('should return job on success', async () => {
      const data = { id: '1' };
      mockHttpService.get.mockReturnValueOnce(of(mockSuccess(data)));

      const result = await service.findOne('1');
      expect(result).toEqual(data);
    });

    it('should handle error', async () => {
      mockHttpService.get.mockReturnValueOnce(mockError());

      const result = await service.findOne('1');
      expect(result).toEqual({ success: false, error: 'Error fetching job 1' });
    });
  });

  describe('getRequests', () => {
    it('should return requests', async () => {
      const data = [{ request: 'request 1' }];
      mockHttpService.get.mockReturnValueOnce(of(mockSuccess(data)));

      const result = await service.getRequests('123');
      expect(result).toEqual(data);
    });

    it('should handle error', async () => {
      mockHttpService.get.mockReturnValueOnce(mockError());

      const result = await service.getRequests('123');
      expect(result).toEqual({ success: false, error: 'Error getting short list requests' });
    });
  });

  describe('create', () => {
    it('should create job', async () => {
      const jobData = { title: 'Developer' };
      const createdBy = 'HR123';
      const created = { id: '1', ...jobData };
      mockHttpService.post.mockReturnValueOnce(of(mockSuccess(created)));

      const result = await service.create(jobData, createdBy);
      expect(result).toEqual(created);
    });

    it('should handle error', async () => {
      mockHttpService.post.mockReturnValueOnce(mockError());

      const result = await service.create({ title: 'Dev' }, 'HR1');
      expect(result).toEqual({ success: false, error: 'Error creating job' });
    });
  });

  describe('update', () => {
    it('should update job', async () => {
      const updated = { id: '1', title: 'Updated Dev' };
      mockHttpService.patch.mockReturnValueOnce(of(mockSuccess(updated)));

      const result = await service.update('1', { title: 'Updated Dev' });
      expect(result).toEqual(updated);
    });

    it('should handle error', async () => {
      mockHttpService.patch.mockReturnValueOnce(mockError());

      const result = await service.update('1', { title: 'Updated Dev' });
      expect(result).toEqual({ success: false, error: 'Error updating job 1' });
    });
  });

  describe('remove', () => {
    it('should delete job', async () => {
      const msg = { message: 'Deleted' };
      mockHttpService.delete.mockReturnValueOnce(of(mockSuccess(msg)));

      const result = await service.remove('1');
      expect(result).toEqual(msg);
    });

    it('should handle error', async () => {
      mockHttpService.delete.mockReturnValueOnce(mockError());

      const result = await service.remove('1');
      expect(result).toEqual({ success: false, error: 'Error deleting job 1' });
    });
  });

  describe('findApplicationsByJob', () => {
    it('should return applications', async () => {
      const apps = [{ id: 1, name: 'Jane' }];
      mockHttpService.get.mockReturnValueOnce(of(mockSuccess(apps)));

      const result = await service.findApplicationsByJob('1');
      expect(result).toEqual(apps);
    });

    it('should handle error', async () => {
      mockHttpService.get.mockReturnValueOnce(mockError());

      const result = await service.findApplicationsByJob('1');
      expect(result).toEqual({ success: false, error: 'Error fetching applications for job 1' });
    });
  });

  describe('shortList', () => {
    it('should return shortlist', async () => {
      const list = [{ name: 'Shortlisted' }];
      mockHttpService.get.mockReturnValueOnce(of(mockSuccess(list)));

      const result = await service.shortList('HM123');
      expect(result).toEqual(list);
    });

    it('should handle error', async () => {
      mockHttpService.get.mockReturnValueOnce(mockError());

      const result = await service.shortList('HM123');
      expect(result).toEqual({
        success: false,
        error: 'Error fetching short list requests for hiring manager HM123',
      });
    });
  });
});
