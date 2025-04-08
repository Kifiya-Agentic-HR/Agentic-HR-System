import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

const mockRecommendationService = {
  createRecommendations: jest.fn(),
  getRecommendationsByJobId: jest.fn(),
};

describe('RecommendationController', () => {
  let controller: RecommendationController;
  let service: RecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationController],
      providers: [
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
      ],
    }).compile();

    controller = module.get<RecommendationController>(RecommendationController);
    service = module.get<RecommendationService>(RecommendationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRecommendations', () => {
    it('should return error if job_id is not provided', async () => {
      const result = await controller.createRecommendations('');
      expect(result).toEqual({ success: false, error: 'Job ID is required' });
    });

    it('should call service and return recommendations if job_id is provided', async () => {
      const job_id = 'job123';
      const mockResult = [{ id: 'rec1' }];
      mockRecommendationService.createRecommendations.mockResolvedValue(mockResult);

      const result = await controller.createRecommendations(job_id);
      expect(result).toEqual(mockResult);
      expect(service.createRecommendations).toHaveBeenCalledWith(job_id);
    });
  });

  describe('getRecommendationsByJobId', () => {
    it('should return error if job_id is not provided', async () => {
      const result = await controller.getRecommendationsByJobId('');
      expect(result).toEqual({ success: false, error: 'Job ID is required' });
    });

    it('should return recommendations by job_id if valid', async () => {
      const job_id = 'job456';
      const mockResult = [{ id: 'recA' }, { id: 'recB' }];
      mockRecommendationService.getRecommendationsByJobId.mockResolvedValue(mockResult);

      const result = await controller.getRecommendationsByJobId(job_id);
      expect(result).toEqual(mockResult);
      expect(service.getRecommendationsByJobId).toHaveBeenCalledWith(job_id);
    });
  });
});
