import { Module } from '@nestjs/common';
import { AdformService } from './adform.service';
import { AdformController } from './adform.controller';

@Module({
  controllers: [AdformController],
  providers: [AdformService],
  exports: [AdformService],
})
export class AdformModule {}
