import { Test, TestingModule } from '@nestjs/testing';
import { InterviewController } from './interviews.controller';
import { InterviewService } from './interviews.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockInterviewService = {
  schedule: jest.fn().mockResolvedValue({ success: true }),
  createSession: jest.fn().mockResolvedValue({ sessionId: '12345' }),
  sendChat: jest.fn().mockResolvedValue({ reply: 'response from AI' }),
  flagInterview: jest.fn().mockResolvedValue({ flagged: true }),
  getInterview: jest.fn().mockResolvedValue({ id: 'int123', data: {} }),
};

describe('InterviewController', () => {
  let controller: InterviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewController],
      providers: [
        { provide: InterviewService, useValue: mockInterviewService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InterviewController>(InterviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should schedule an interview', async () => {
    const result = await controller.schedule({ application_id: 'app123' });
    expect(result).toEqual({ success: true });
    expect(mockInterviewService.schedule).toHaveBeenCalledWith('app123');
  });

  it('should create a session', async () => {
    const result = await controller.createSession({ interview_id: 'int123' });
    expect(result).toEqual({ sessionId: '12345' });
    expect(mockInterviewService.createSession).toHaveBeenCalledWith('int123');
  });

  it('should send chat', async () => {
    const result = await controller.chat({ session_id: 'sess123', user_answer: 'hello' });
    expect(result).toEqual({ reply: 'response from AI' });
    expect(mockInterviewService.sendChat).toHaveBeenCalledWith('sess123', 'hello');
  });

  it('should flag an interview', async () => {
    const result = await controller.flag({ interview_id: 'int123', violations: 'late' });
    expect(result).toEqual({ flagged: true });
    expect(mockInterviewService.flagInterview).toHaveBeenCalledWith('int123', 'late');
  });

  it('should get an interview', async () => {
    const result = await controller.getInterview('int123');
    expect(result).toEqual({ id: 'int123', data: {} });
    expect(mockInterviewService.getInterview).toHaveBeenCalledWith('int123');
  });
});