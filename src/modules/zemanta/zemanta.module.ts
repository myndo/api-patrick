import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { ZemantaController } from './zemanta.controller';
import { ZemantaService } from './zemanta.service';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [ZemantaController],
  providers: [ZemantaService],
  exports: [ZemantaService],
})
export class ZemantaModule {}
