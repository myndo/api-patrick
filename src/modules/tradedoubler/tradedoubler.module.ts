import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { TradeDoublerJobsService } from './tradedoubler.service';
import { TradeDoublerController } from './tradedoubler.controller';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [TradeDoublerController],
  providers: [TradeDoublerJobsService],
  exports: [TradeDoublerJobsService],
})
export class TradeDoublerModule {}
