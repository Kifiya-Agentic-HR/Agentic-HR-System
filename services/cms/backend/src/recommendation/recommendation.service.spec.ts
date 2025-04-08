import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

describe('RecommendationService', () => {
  let service: RecommendationService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  describe('createRecommendations', () => {
    it('should return data on successful POST', async () => {
      const job_id = 'job123';
      const mockResponse: AxiosResponse = {
        data: { success: true, message: 'Recommendations created' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {
            headers: undefined
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createRecommendations(job_id);
      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/recommendations'),
        null,
        { params: { job_id } }
      );
    });

    it('should handle errors and return fallback object', async () => {
      const job_id = 'job123';
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Post failed')));

      const result = await service.createRecommendations(job_id);
      expect(result).toEqual({
        success: false,
        error: 'Error sending applications to screening service',
      });
    });
  });

  describe('getRecommendationsByJobId', () => {
    it('should return data on successful GET', async () => {
      const job_id = 'job456';
      const mockResponse: AxiosResponse = {
        data: { success: true, recommendations: ['app1', 'app2'] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
            headers: undefined
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getRecommendationsByJobId(job_id);
      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/recommendations/${job_id}`)
      );
    });

    it('should handle errors and return fallback object', async () => {
      const job_id = 'job456';
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Get failed')));

      const result = await service.getRecommendationsByJobId(job_id);
      expect(result).toEqual({
        success: false,
        error: 'Error retrieving recommended applications',
      });
    });
  });
});
