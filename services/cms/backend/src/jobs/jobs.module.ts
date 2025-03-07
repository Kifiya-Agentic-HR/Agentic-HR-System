import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
