import { Injectable, HttpException, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
    this.notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL') || 'http://notification-service/';
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async prepareAndSendOtp(email: string, otp: string, type: 'otp_verification' | 'otp_resend'): Promise<void> {
    const payload = {
      to: email,
      otp: otp,
      type: type,
      subject: type === 'otp_verification' ? 'Your Verification Code' : 'Your OTP Code (Resent)',
      title: 'Account Verification',
    };

      await firstValueFrom(
        this.httpService.post(`${this.notificationUrl}notify/email`, payload)
      );
  }

  async sendOtp(email: string): Promise<void> {
      const otp = this.generateOtp();
      await this.redis.set(`otp:${email}`, JSON.stringify({ otp }), 'EX', this.otpExpirySeconds);
      await this.prepareAndSendOtp(email, otp, 'otp_verification');
  }

  async resendOtp(email: string): Promise<void> {
    const key = `otp:${email}`;
    const countKey = `otp_count:${email}`;

      const currentCount = await this.redis.get(countKey) || '0';

      if (parseInt(currentCount) >= 3) {
        throw new HttpException('OTP resend limit reached. You can only resend OTP 3 times.', HttpStatus.TOO_MANY_REQUESTS);
      }

      let otpData = await this.redis.get(key);
      let otp: string;

      if (otpData) {
        const parsedData = JSON.parse(otpData);
        otp = parsedData.otp;
      } else {
        otp = this.generateOtp();
        await this.redis.set(key, JSON.stringify({ otp }), 'EX', this.otpExpirySeconds);
      }

      // Increment the resend attempt count and set expiration
      await this.redis.multi()
        .incr(countKey)
        .expire(countKey, this.otpExpirySeconds)
        .exec();

      await this.prepareAndSendOtp(email, otp, 'otp_verification');
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email}`;
      const storedData = await this.redis.get(key);

      if (!storedData) {
        throw new BadRequestException('OTP has expired or does not exist.');
      }

      const { otp: storedOtp } = JSON.parse(storedData);
      if (storedOtp === otp) {
        await this.redis.del(key);
        return true;
      }

      throw new BadRequestException('Invalid OTP provided.');
  }

  async checkRedisConnection(): Promise<boolean> {
      await this.redis.ping();
      return true;
  }
}