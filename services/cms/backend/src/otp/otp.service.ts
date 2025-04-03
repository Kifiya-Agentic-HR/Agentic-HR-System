// src/otp/otp.service.ts
import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis'; // Import Redis from ioredis
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly notificationUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.notificationUrl = this.configService.get('NOTIFICATION_SERVICE_URL') || 'http://notification-service';
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    const expiresInSeconds = 300; // 5 minutes

    try {
      await this.redis.set(
        `otp:${email}`,
        JSON.stringify({ otp }),
        'EX',
        expiresInSeconds,
      );

      await this.httpService.post(`${this.notificationUrl}/notify/email`, {
        type: 'otp_verification',
        subject: 'Your OTP Code',
        to: email,
        otp: otp,
        expires_in_minutes: 5,
      }).toPromise();
    } catch (error) {
      throw new HttpException(
        'Failed to send OTP via notification service',
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