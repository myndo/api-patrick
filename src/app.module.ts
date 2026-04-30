import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './app/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { RtbHouseModule } from './modules/rtb_house/rtb_house.module';
import { ZemantaModule } from './modules/zemanta/zemanta.module';
import { TradeDoublerModule } from './modules/tradedoubler/tradedoubler.module';
import { AdformModule } from './modules/adform/adform.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    RtbHouseModule,
    ZemantaModule,
    TradeDoublerModule,
    AdformModule,
  ],
})
export class AppModule {}
