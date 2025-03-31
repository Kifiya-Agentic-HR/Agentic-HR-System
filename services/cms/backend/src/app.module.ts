import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { ShortListModule } from './short_list/short_list.module';
import { BulkModule } from './bulk/bulk.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
    JobsModule,
    InterviewsModule,
    ApplicationsModule,
    ShortListModule,
    BulkModule,
  ],
})
export class AppModule {}
