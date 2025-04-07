import { Test, TestingModule } from '@nestjs/testing';
import { ShortListService } from './short_list.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ShortListService', () => {
  let service: ShortListService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortListService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ShortListService>(ShortListService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortList', () => {
    it('should return response data on success', async () => {
      const data = { success: true };
      const response: AxiosResponse = { data, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };

      mockHttpService.post.mockReturnValue(of(response));

      const result = await service.createShortList({ job_id: 'job1', hiring_manager_id: 'hm1' });
      expect(result).toEqual(data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/short_list/hm1'),
        { job_id: 'job1', hiring_manager_id: 'hm1' }
      );
    });

    it('should return error object on failure', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Post failed')));

      const result = await service.createShortList({ job_id: 'job1', hiring_manager_id: 'hm1' });
      expect(result).toEqual({ success: false, error: 'Error posting short list' });
    });
  });

  describe('getRequests', () => {
    it('should return response data on success', async () => {
      const data = [{ id: '1' }];
      const response: AxiosResponse = { data, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };

      mockHttpService.get.mockReturnValue(of(response));

      const result = await service.getRequests('hm1');
      expect(result).toEqual(data);
      expect(mockHttpService.get).toHaveBeenCalledWith(expect.stringContaining('/short_list/hm1'));
    });

    it('should return error object on failure', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Get failed')));

      const result = await service.getRequests('hm1');
      expect(result).toEqual({ success: false, error: 'Error getting short list requests' });
    });
  });

  describe('deleteRequest', () => {
    it('should return response data on success', async () => {
      const data = { success: true };
      const response: AxiosResponse = { data, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };

      mockHttpService.delete.mockReturnValue(of(response));

      const result = await service.deleteRequest('123', { job_id: 'job1', hiring_manager_id: 'hm1' });

      expect(result).toEqual(data);
      expect(mockHttpService.delete).toHaveBeenCalledWith(expect.stringContaining('/short_list'), {
        params: {
          id: '123',
          job_id: 'job1',
          hiring_manager_id: 'hm1',
        },
      });
    });

    it('should return error object on failure', async () => {
      mockHttpService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      const result = await service.deleteRequest('123', { job_id: 'job1', hiring_manager_id: 'hm1' });
      expect(result).toEqual({ success: false, error: 'Error deleting short list request' });
    });
  });

  describe('getShortListByJobId', () => {
    it('should return response data on success', async () => {
      const data = [{ id: 'shortlist1' }];
      const response: AxiosResponse = { data, status: 200, statusText: 'OK', headers: {}, config: {
          headers: undefined
      } };

      mockHttpService.get.mockReturnValue(of(response));

      const result = await service.getShortListByJobId('job1');
      expect(result).toEqual(data);
      expect(mockHttpService.get).toHaveBeenCalledWith(expect.stringContaining('/short_list/job/job1'));
    });

    it('should return error object on failure', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Get failed')));

      const result = await service.getShortListByJobId('job1');
      expect(result).toEqual({ success: false, error: 'Error getting short list by job id' });
    });
  });
});
