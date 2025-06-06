import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service'; 

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

const mockHttpService = () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
});

const mockJobsService = {
  findJobById: jest.fn(), 
};

const mockResponse = (data: any): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: undefined,
  },
});

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let httpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: HttpService, useFactory: mockHttpService },
        { provide: JobsService, useValue: mockJobsService }, // <- added this
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should fetch all applications', async () => {
    httpService.get.mockReturnValue(of(mockResponse(['app1', 'app2'])));
    const result = await service.findAll();
    expect(result).toEqual(['app1', 'app2']);
  });

  it('should fetch one application', async () => {
    httpService.get.mockReturnValue(of(mockResponse({ id: '123' })));
    const result = await service.findOne('123');
    expect(result).toEqual({ id: '123' });
  });

  it('should create an application', async () => {
    const cvFile = {
      buffer: Buffer.from('test'),
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
    };
    const appData = { name: 'test' };
    httpService.post.mockReturnValue(of(mockResponse({ success: true })));

    const result = await service.create(appData, cvFile as any);
    expect(result).toEqual({ success: true });
  });

  it('should reject an application', async () => {
    httpService.patch.mockReturnValue(of(mockResponse({ success: true })));
    const result = await service.reject('123');
    expect(result).toEqual({ success: true });
  });

  it('should accept an application', async () => {
    httpService.patch.mockReturnValue(of(mockResponse({ success: true })));
    const result = await service.accept('123');
    expect(result).toEqual({ success: true });
  });

  it('should edit application score', async () => {
    httpService.put.mockReturnValue(of(mockResponse({ updated: true })));
    const result = await service.editScore('123', { score: 90 });
    expect(result).toEqual({ updated: true });
  });
});
