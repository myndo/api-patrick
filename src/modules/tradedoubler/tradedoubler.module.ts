import { Module } from '@nestjs/common';
import { TradeDoublerJobsService } from './tradedoubler.service';
import { TradeDoublerController } from './tradedoubler.controller';

@Module({
  controllers: [TradeDoublerController],
  providers: [TradeDoublerJobsService],
  exports: [TradeDoublerJobsService],
})
export class TradeDoublerModule {}
