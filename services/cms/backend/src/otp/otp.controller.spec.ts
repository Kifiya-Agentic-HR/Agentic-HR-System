import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OtpController', () => {
  let controller: OtpController;
  let service: OtpService;

  const mockOtpService = {
    sendOtp: jest.fn(),
    resendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    checkRedisConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [{ provide: OtpService, useValue: mockOtpService }],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    service = module.get<OtpService>(OtpService);

    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should send OTP for valid email', async () => {
      mockOtpService.sendOtp.mockResolvedValue(undefined);
      const result = await controller.sendOtp('test@example.com');
      expect(result).toEqual({ message: 'OTP sent successfully' });
      expect(mockOtpService.sendOtp).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw BAD_REQUEST for invalid email', async () => {
      await expect(controller.sendOtp('invalid-email')).rejects.toThrow(
        new HttpException('Invalid email address', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw INTERNAL_SERVER_ERROR on service error', async () => {
      mockOtpService.sendOtp.mockRejectedValue(new Error('Email error'));
      await expect(controller.sendOtp('test@example.com')).rejects.toThrow(
        new HttpException('Failed to send OTP', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('resendOtp', () => {
    it('should resend OTP for valid email', async () => {
      mockOtpService.resendOtp.mockResolvedValue(undefined);
      const result = await controller.resendOtp('resend@example.com');
      expect(result).toEqual({ message: 'OTP resent successfully' });
      expect(mockOtpService.resendOtp).toHaveBeenCalledWith('resend@example.com');
    });

    it('should throw BAD_REQUEST for missing email', async () => {
      await expect(controller.resendOtp('')).rejects.toThrow(
        new HttpException('Invalid email address', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw INTERNAL_SERVER_ERROR on service failure', async () => {
      mockOtpService.resendOtp.mockRejectedValue(new Error('fail'));
      await expect(controller.resendOtp('resend@example.com')).rejects.toThrow(
        new HttpException('Failed to resend OTP', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('verifyOtp', () => {
    it('should return success if OTP is valid', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      const result = await controller.verifyOtp({ email: 'user@example.com', otp: '123456' });
      expect(result).toEqual({ message: 'OTP verified successfully' });
      expect(mockOtpService.verifyOtp).toHaveBeenCalledWith('user@example.com', '123456');
    });

    it('should throw BAD_REQUEST if email or otp is missing', async () => {
      await expect(controller.verifyOtp({ email: '', otp: '' })).rejects.toThrow(
        new HttpException('Email and OTP are required', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw UNAUTHORIZED if OTP is invalid', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);
      await expect(controller.verifyOtp({ email: 'user@example.com', otp: 'wrong' })).rejects.toThrow(
        new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('checkHealth', () => {
    it('should return redis: connected', async () => {
      mockOtpService.checkRedisConnection.mockResolvedValue(true);
      const result = await controller.checkHealth();
      expect(result).toEqual({ status: 'ok', redis: 'connected' });
    });

    it('should return redis: disconnected', async () => {
      mockOtpService.checkRedisConnection.mockResolvedValue(false);
      const result = await controller.checkHealth();
      expect(result).toEqual({ status: 'ok', redis: 'disconnected' });
    });
  });
});
