import { Test, TestingModule } from '@nestjs/testing';
import { InterviewService } from './interviews.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('InterviewService', () => {
  let service: InterviewService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('schedule', () => {
    it('should return success response', async () => {
      const result: AxiosResponse = {
        data: { success: true },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {
            headers: undefined
        },
      };

      mockHttpService.post.mockReturnValueOnce(of(result));

      const response = await service.schedule('app123');
      expect(response).toEqual({ success: true });
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/interview/schedule'),
        { application_id: 'app123' },
      );
    });

    it('should handle error', async () => {
      mockHttpService.post.mockReturnValueOnce(throwError(() => new Error('Network error')));
      const response = await service.schedule('app123');
      expect(response).toEqual({ success: false, error: 'Error scheduling interview' });
    });
  });

  describe('createSession', () => {
    it('should return success response', async () => {
      const result = { data: { session: 'abc123' } } as AxiosResponse;
      mockHttpService.post.mockReturnValueOnce(of(result));

      const response = await service.createSession('intv1');
      expect(response).toEqual({ session: 'abc123' });
    });

    it('should handle error', async () => {
      mockHttpService.post.mockReturnValueOnce(throwError(() => new Error('Create error')));
      const response = await service.createSession('intv1');
      expect(response).toEqual({ success: false, error: 'Error creating session' });
    });
  });

  describe('sendChat', () => {
    it('should return chat response', async () => {
      const result = { data: { reply: 'Thanks!' } } as AxiosResponse;
      mockHttpService.post.mockReturnValueOnce(of(result));

      const response = await service.sendChat('session1', 'Hi!');
      expect(response).toEqual({ reply: 'Thanks!' });
    });

    it('should handle chat error', async () => {
      mockHttpService.post.mockReturnValueOnce(throwError(() => new Error('Chat error')));
      const response = await service.sendChat('session1', 'Hi!');
      expect(response).toEqual({ success: false, error: 'Error processing chat message' });
    });
  });

  describe('flagInterview', () => {
    it('should return flag success', async () => {
      const result = { data: { flagged: true } } as AxiosResponse;
      mockHttpService.post.mockReturnValueOnce(of(result));

      const response = await service.flagInterview('intvX', 'cheating');
      expect(response).toEqual({ flagged: true });
    });

    it('should handle flag error', async () => {
      mockHttpService.post.mockReturnValueOnce(throwError(() => new Error('Flag error')));
      const response = await service.flagInterview('intvX', 'cheating');
      expect(response).toEqual({ success: false, error: 'Error flagging interview' });
    });
  });

  describe('getInterview', () => {
    it('should return interview data', async () => {
      const result = { data: { id: 'intvY' } } as AxiosResponse;
      mockHttpService.get.mockReturnValueOnce(of(result));

      const response = await service.getInterview('intvY');
      expect(response).toEqual({ id: 'intvY' });
    });

    it('should handle get interview error', async () => {
      mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('Not found')));
      const response = await service.getInterview('intvY');
      expect(response).toEqual({ success: false, error: 'Error fetching interview' });
    });
  });
});
