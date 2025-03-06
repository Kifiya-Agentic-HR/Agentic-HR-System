import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InterviewController } from './interviews.controller';
import { InterviewService } from './interviews.service';

@Module({
  imports: [HttpModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewsModule {}
