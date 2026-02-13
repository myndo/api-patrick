import { Module } from '@nestjs/common';
import { JobsService } from './rtb_house.service';
import { RtbHouseController } from './rtb_house.controller';

@Module({
  controllers: [RtbHouseController],
  providers: [JobsService],
  exports: [JobsService],
})
export class RtbHouseModule {}
