import { Module } from '@nestjs/common';
import { ZemantaController } from './zemanta.controller';
import { ZemantaService } from './zemanta.service';

@Module({
  controllers: [ZemantaController],
  providers: [ZemantaService],
  exports: [ZemantaService],
})
export class ZemantaModule {}
