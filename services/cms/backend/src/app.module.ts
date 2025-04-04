import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { ShortListModule } from './short_list/short_list.module';
import { BulkModule } from './bulk/bulk.module';
import { redisStore } from 'cache-manager-redis-yet';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
    JobsModule,
    InterviewsModule,
    RecommendationModule,
    ApplicationsModule,
    ShortListModule,
    BulkModule,
    OtpModule,
  ],
  providers: [
    {
      provide: 'CACHE_MANAGER',
      useFactory: async (): Promise<any> => {
        // Use REDIS_HOST and REDIS_PORT from env (with defaults)
        const host = process.env.REDIS_HOST || 'redis';
        const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
        const store = await redisStore({
          socket: { host, port },
          ttl: 30 * 1000,
        });
        // Dynamically import the cache-manager module
        const cacheManagerModule = await import('cache-manager');
        let createCacheFn: Function;
        if (cacheManagerModule.default && typeof cacheManagerModule.default.createCache === 'function') {
          createCacheFn = cacheManagerModule.default.createCache;
        } else if (typeof cacheManagerModule.createCache === 'function') {
          createCacheFn = cacheManagerModule.createCache;
        } else {
          throw new Error('Could not find createCache function in cache-manager module');
        }
        return createCacheFn({ store });
      },
    },
  ],
  exports: ['CACHE_MANAGER'],
})
export class AppModule {}
