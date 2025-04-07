import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return jobs on success', async () => {
      const response: AxiosResponse = { data: ['job1'], status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.get.mockReturnValue(of(response));
      const result = await service.findAll();
      expect(result).toEqual(['job1']);
    });

    it('should return error on failure', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('fail')));
      const result = await service.findAll();
      expect(result).toHaveProperty('success', false);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      const response: AxiosResponse = { data: { id: '1' }, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.get.mockReturnValue(of(response));
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('create', () => {
    it('should post job data', async () => {
      const response: AxiosResponse = { data: { id: '123' }, status: 201, statusText: 'Created', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.post.mockReturnValue(of(response));
      const result = await service.create({ title: 'test' }, 'creator1');
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('update', () => {
    it('should patch job data', async () => {
      const response: AxiosResponse = { data: { id: '123' }, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.patch.mockReturnValue(of(response));
      const result = await service.update('123', { title: 'updated' });
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('remove', () => {
    it('should delete job by id', async () => {
      const response: AxiosResponse = { data: { deleted: true }, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.delete.mockReturnValue(of(response));
      const result = await service.remove('123');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('findApplicationsByJob', () => {
    it('should return applications for job id', async () => {
      const response: AxiosResponse = { data: ['app1'], status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.get.mockReturnValue(of(response));
      const result = await service.findApplicationsByJob('job123');
      expect(result).toEqual(['app1']);
    });
  });

  describe('shortList', () => {
    it('should return shortlist for hiringManagerId', async () => {
      const response: AxiosResponse = { data: ['shortlist1'], status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.get.mockReturnValue(of(response));
      const result = await service.shortList('manager123');
      expect(result).toEqual(['shortlist1']);
    });
  });

  describe('getRequests', () => {
    it('should return requests for hiringManagerId', async () => {
      const response: AxiosResponse = { data: ['request1'], status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };
      mockHttpService.get.mockReturnValue(of(response));
      const result = await service.getRequests('manager123');
      expect(result).toEqual(['request1']);
    });
  });
});
