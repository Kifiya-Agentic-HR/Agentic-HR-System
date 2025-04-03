import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { RedisModule } from '@nestjs-modules/ioredis'; // Ensure correct import
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule], // Ensure ConfigModule is available
      useFactory: (configService: ConfigService) => ({
        // Access Redis settings from the configuration
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'), // This can be undefined
        db: configService.get<number>('REDIS_DB', 0) // Default database index
      }),
      inject: [ConfigService] // Inject ConfigService to use it in the factory function
    }),
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
