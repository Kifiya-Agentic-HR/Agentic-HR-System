import { Module } from '@nestjs/common';
import { ShortListService } from './short_list.service';
import { ShortListController } from './short_list.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [ShortListController],
  providers: [ShortListService],
  exports: [ShortListService],
})
export class ShortListModule {}
