import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async sendOtp(@Body('email') email: string) {
    if (!email || !this.isValidEmail(email)) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.otpService.sendOtp(email);
      return { message: 'OTP sent successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to send OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // New endpoint to resend OTP
  @Post('resend')
  async resendOtp(@Body('email') email: string) {
    if (!email || !this.isValidEmail(email)) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.otpService.resendOtp(email);
      return { message: 'OTP resent successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to resend OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const { email, otp } = body;

    if (!email || !otp) {
      throw new HttpException(
        'Email and OTP are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
    }

    return { message: 'OTP verified successfully' };
  }

  @Get('health')
  async checkHealth() {
    const redisConnected = await this.otpService.checkRedisConnection();
    return {
      status: 'ok',
      redis: redisConnected ? 'connected' : 'disconnected',
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
