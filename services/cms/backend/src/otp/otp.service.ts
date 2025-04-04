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

    console.log('Payload prepared:', payload);
    console.log(`Sending OTP to notification service at ${this.notificationUrl}notify/email`);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.notificationUrl}notify/email`, payload)
      );
      console.log('OTP sent to notification service successfully');
    } catch (error) {
      console.error('Error sending OTP:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to send OTP via notification service. ' + (error.response?.data?.detail || error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    console.log('OTP Generated:', otp); // Log OTP generation
    console.log('Attempting to set OTP in Redis'); // Log before setting OTP

    await this.redis.set(`otp:${email}`, JSON.stringify({ otp }), 'EX', this.otpExpirySeconds);
    console.log('OTP set in Redis successfully'); // Log after setting OTP

    await this.prepareAndSendOtp(email, otp, 'otp_verification');
  }

async resendOtp(email: string): Promise<void> {
  const key = `otp:${email}`;
  const countKey = `otp_count:${email}`;
  console.log(`[resendOtp] Starting OTP resend process for email: ${email}`);
  
  // Retrieve the current count of resend attempts or initialize to 0 if not present
  const currentCount = await this.redis.get(countKey) || '0';
  console.log(`[resendOtp] Current resend attempts: ${currentCount}`);

  if (parseInt(currentCount) >= 3) {
    console.error(`[resendOtp] OTP resend limit reached for email: ${email}`);
    throw new HttpException(
      'OTP resend limit reached. You can only resend OTP 3 times.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  let otpData = await this.redis.get(key);
  let otp: string;

  if (otpData) {
    console.log(`[resendOtp] Found existing OTP data, parsing...`);
    const parsedData = JSON.parse(otpData);
    otp = parsedData.otp;
  } else {
    console.log(`[resendOtp] No existing OTP found or OTP expired, generating new OTP`);
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

