import { Test, TestingModule } from '@nestjs/testing';
import { ShortListController } from './short_list.controller';
import { ShortListService } from './short_list.service';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});


class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

class MockRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}


const mockShortListService = {
  getRequests: jest.fn(),
  getShortListByJobId: jest.fn(),
  createShortList: jest.fn(),
  deleteRequest: jest.fn(),
};

describe('ShortListController', () => {
  let controller: ShortListController;
  let service: ShortListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortListController],
      providers: [
        {
          provide: ShortListService,
          useValue: mockShortListService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(MockRolesGuard)
      .compile();

    controller = module.get<ShortListController>(ShortListController);
    service = module.get<ShortListService>(ShortListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRequests', () => {
    it('should return error if hiring_manager_id is missing', async () => {
      const result = await controller.getRequests('');
      expect(result).toEqual({ success: false, error: 'No hm id found' });
    });

    it('should return result from service', async () => {
      const hiring_manager_id = 'hm123';
      const mockResponse = [{ candidateId: '1' }];
      mockShortListService.getRequests.mockResolvedValue(mockResponse);

      const result = await controller.getRequests(hiring_manager_id);
      expect(result).toEqual(mockResponse);
      expect(service.getRequests).toHaveBeenCalledWith(hiring_manager_id);
    });
  });

  describe('getShortListByJobId', () => {
    it('should return error if job_id is missing', async () => {
      const result = await controller.getShortListByJobId('');
      expect(result).toEqual({ success: false, error: 'No job id found' });
    });

    it('should return shortlist by job_id from service', async () => {
      const job_id = 'job789';
      const mockData = [{ candidateId: '1', score: 85 }];
      mockShortListService.getShortListByJobId.mockResolvedValue(mockData);

      const result = await controller.getShortListByJobId(job_id);
      expect(result).toEqual(mockData);
      expect(service.getShortListByJobId).toHaveBeenCalledWith(job_id);
    });
  });

  describe('createShortList', () => {
    it('should return error if job_id or hiring_manager_id is missing', async () => {
      const result = await controller.createShortList('', '');
      expect(result).toEqual({
        success: false,
        error: 'Missing hr_manager_id or job_id',
      });
    });

    it('should call service with job_id and hiring_manager_id', async () => {
      const job_id = 'job123';
      const hiring_manager_id = 'hm456';
      const mockCreated = { id: 'shortlist1' };

      mockShortListService.createShortList.mockResolvedValue(mockCreated);
      const result = await controller.createShortList(hiring_manager_id, job_id);
      expect(result).toEqual(mockCreated);
      expect(service.createShortList).toHaveBeenCalledWith({
        job_id,
        hiring_manager_id,
      });
    });
  });

  describe('deleteRequest', () => {
    it('should return error if required params are missing', async () => {
      const result = await controller.deleteRequest('', '', '');
      expect(result).toEqual({
        success: false,
        error: 'Missing one or more required parameters',
      });
    });

    it('should call service to delete request', async () => {
      const id = 'req123';
      const hiring_manager_id = 'hm456';
      const job_id = 'job789';
      const mockDeleted = { success: true };

      mockShortListService.deleteRequest.mockResolvedValue(mockDeleted);
      const result = await controller.deleteRequest(id, hiring_manager_id, job_id);
      expect(result).toEqual(mockDeleted);
      expect(service.deleteRequest).toHaveBeenCalledWith(id, {
        job_id,
        hiring_manager_id,
      });
    });
  });
});
