import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OtpService {
  private readonly notificationUrl: string;
  private readonly otpExpirySeconds = 300; // 5 minutes

  constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.notificationUrl =
      this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
      'http://notification-service';
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string): Promise<void> {
    const otp = this.generateOtp();

    try {
      await this.redis.set(
        `otp:${email}`,
        JSON.stringify({ otp }),
        'EX',
        this.otpExpirySeconds,
      );

      const payload = {
        type: 'otp_verification',
        subject: 'Your OTP Code',
        to: email,
        otp: otp,
        expires_in_minutes: this.otpExpirySeconds / 60,
      };

      await firstValueFrom(
        this.httpService.post(`${this.notificationUrl}/notify/email`, payload),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to send OTP via notification service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Resend OTP: If an OTP exists and is still valid, reuse it; otherwise, generate a new one.
  async resendOtp(email: string): Promise<void> {
    const key = `otp:${email}`;
    let otpData = await this.redis.get(key);
    let otp: string;

    if (otpData) {
      otp = JSON.parse(otpData).otp;
    } else {
      otp = this.generateOtp();
      await this.redis.set(
        key,
        JSON.stringify({ otp }),
        'EX',
        this.otpExpirySeconds,
      );
    }

    const payload = {
      type: 'otp_resend',
      subject: 'Your OTP Code (Resent)',
      to: email,
      otp: otp,
      expires_in_minutes: this.otpExpirySeconds / 60,
    };

    try {
      await firstValueFrom(
        this.httpService.post(`${this.notificationUrl}/notify/email`, payload),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to resend OTP via notification service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email}`;
    const storedData = await this.redis.get(key);

    if (!storedData) {
      return false;
    }

    const { otp: storedOtp } = JSON.parse(storedData);

    if (storedOtp === otp) {
      await this.redis.del(key);
      return true;
    }

    return false;
  }

  async checkRedisConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}
