import { Module } from '@nestjs/common'; 
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule }  from '@nestjs/cache-manager';
import { OtpModule } from './otp/otp.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { ShortListModule } from './short_list/short_list.module';
import { BulkModule } from './bulk/bulk.module';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    CacheModule.registerAsync({  
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT,
          },
          ttl: 30 * 1000,
        }),
      }),
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    InterviewsModule,
    ApplicationsModule,
    ShortListModule,
    BulkModule,
    OtpModule,
  ],
})
export class AppModule {}