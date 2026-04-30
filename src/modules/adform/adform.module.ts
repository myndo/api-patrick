import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { AdformService } from './adform.service';
import { AdformController } from './adform.controller';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [AdformController],
  providers: [AdformService],
  exports: [AdformService],
})
export class AdformModule {}
