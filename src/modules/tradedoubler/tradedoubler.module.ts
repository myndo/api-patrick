import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { TradeDoublerJobsService } from './tradedoubler.service';
import { TradeDoublerController } from './tradedoubler.controller';
import { ProviderCleanupService } from './provider-cleanup.service';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [TradeDoublerController],
  providers: [TradeDoublerJobsService, ProviderCleanupService],
  exports: [TradeDoublerJobsService],
})
export class TradeDoublerModule {}
