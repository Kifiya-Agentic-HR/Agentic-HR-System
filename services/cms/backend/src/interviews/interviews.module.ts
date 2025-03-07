import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InterviewController } from './interviews.controller';
import { InterviewService } from './interviews.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewsModule {}
