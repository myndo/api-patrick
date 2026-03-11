import { Module } from '@nestjs/common';
import { ZemantaController } from './zemanta.controller';
import { ZemantaService } from './zemanta.service';
import { DatabaseService } from '../../app/database/database.service';

@Module({
  controllers: [ZemantaController],
  providers: [ZemantaService, DatabaseService],
  exports: [ZemantaService],
})
export class ZemantaModule {}
