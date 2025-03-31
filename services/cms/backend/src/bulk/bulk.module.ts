import { Module } from '@nestjs/common';
import { BulkService } from './bulk.service';
import { BulkController } from './bulk.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [BulkController],
  providers: [BulkService],
  exports: [BulkService]
})
export class BulkModule {}