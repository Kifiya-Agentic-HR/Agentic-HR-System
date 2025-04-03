import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): RedisModuleOptions => {
        // If REDIS_URI is provided (as in your docker-compose), use it.
        const redisUri = configService.get<string>('REDIS_URI');
        if (redisUri) {
          return { type: 'single', url: redisUri };
        }
        // Otherwise, build the URL from individual values.
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = configService.get<number>('REDIS_DB', 0);

        let url = `redis://${host}:${port}`;
        if (password) {
          url = `redis://:${password}@${host}:${port}`;
        }
        if (db) {
          url += `/${db}`;
        }
  
        return { type: 'single', url };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
