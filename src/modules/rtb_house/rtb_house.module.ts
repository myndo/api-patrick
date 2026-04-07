import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { JobsService } from './rtb_house.service';
import { RtbHouseController } from './rtb_house.controller';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [RtbHouseController],
  providers: [JobsService],
  exports: [JobsService],
})
export class RtbHouseModule {}
