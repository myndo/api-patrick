import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { GoogleSearchConsoleService } from '../google-search-console/google-search-console.service';

@Module({
  controllers: [OAuthController],
  providers: [GoogleSearchConsoleService],
})
export class OAuthModule {}
