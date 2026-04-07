import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { ZemantaController } from './zemanta.controller';
import { ZemantaService } from './zemanta.service';
import { DatabaseService } from '../../app/database/database.service';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [ZemantaController],
  providers: [ZemantaService, DatabaseService],
  exports: [ZemantaService],
})
export class ZemantaModule {}
