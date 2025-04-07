import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { HttpException } from '@nestjs/common';

// Import correct token for Redis
const REDIS_CLIENT = 'default_IORedisModuleConnectionToken';

describe('OtpService', () => {
  let otpService: OtpService;
  let redisMock: any;
  let httpServiceMock: any;
  let configServiceMock: any;

  beforeEach(async () => {
    redisMock = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      ping: jest.fn(),
      multi: jest.fn().mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    httpServiceMock = {
      post: jest.fn().mockReturnValue(of({ data: 'sent' })),
    };

    configServiceMock = {
      get: jest.fn().mockReturnValue('http://notification-service/'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: REDIS_CLIENT, useValue: redisMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
  });
  
  describe('sendOtp', () => {
    it('should store otp in redis and send it via notification service', async () => {
      await otpService.sendOtp('test@example.com');

      expect(redisMock.set).toHaveBeenCalled();
      expect(httpServiceMock.post).toHaveBeenCalledWith(
        'http://notification-service/notify/email',
        expect.objectContaining({ to: 'test@example.com' })
      );
    });
  });

  describe('resendOtp', () => {
    it('should resend existing OTP and increment count', async () => {
      redisMock.get = jest.fn()
        .mockResolvedValueOnce('0') // countKey
        .mockResolvedValueOnce(JSON.stringify({ otp: '123456' })); // key

      redisMock.multi().exec.mockResolvedValue([]);

      await otpService.resendOtp('test@example.com');

      expect(httpServiceMock.post).toHaveBeenCalled();
    });

    it('should generate new OTP if none exists', async () => {
      redisMock.get = jest.fn()
        .mockResolvedValueOnce('0') // countKey
        .mockResolvedValueOnce(null); // key

      redisMock.multi().exec.mockResolvedValue([]);

      await otpService.resendOtp('test@example.com');

      expect(redisMock.set).toHaveBeenCalled();
    });

    it('should throw if resend limit is exceeded', async () => {
      redisMock.get = jest.fn().mockResolvedValue('3');

      await expect(otpService.resendOtp('test@example.com'))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('verifyOtp', () => {
    it('should return true and delete OTP if matched', async () => {
      redisMock.get = jest.fn().mockResolvedValue(JSON.stringify({ otp: '123456' }));

      const result = await otpService.verifyOtp('test@example.com', '123456');
      expect(result).toBe(true);
      expect(redisMock.del).toHaveBeenCalled();
    });

    it('should return false if no OTP stored', async () => {
      redisMock.get = jest.fn().mockResolvedValue(null);

      const result = await otpService.verifyOtp('test@example.com', '123456');
      expect(result).toBe(false);
    });

    it('should return false if OTP does not match', async () => {
      redisMock.get = jest.fn().mockResolvedValue(JSON.stringify({ otp: '654321' }));

      const result = await otpService.verifyOtp('test@example.com', '123456');
      expect(result).toBe(false);
    });
  });

  describe('checkRedisConnection', () => {
    it('should return true if redis responds to ping', async () => {
      redisMock.ping = jest.fn().mockResolvedValue('PONG');
      const result = await otpService.checkRedisConnection();
      expect(result).toBe(true);
    });

    it('should return false if redis ping throws', async () => {
      redisMock.ping = jest.fn().mockRejectedValue(new Error('fail'));
      const result = await otpService.checkRedisConnection();
      expect(result).toBe(false);
    });
  });
});
