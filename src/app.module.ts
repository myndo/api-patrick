import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './app/database/database.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { UsersModule } from './modules/users/users.module';
import { RtbHouseModule } from './modules/rtb_house/rtb_house.module';
import { ShopifyModule } from './modules/shopify/shopify.module';
import { GoogleSearchConsoleModule } from './modules/google-search-console/google-search-console.module';
import { OAuthModule } from './modules/oauth/oauth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    ProfilesModule,
    UsersModule,
    RtbHouseModule,
    ShopifyModule,
    GoogleSearchConsoleModule,
    OAuthModule,
  ],
})
export class AppModule {}
