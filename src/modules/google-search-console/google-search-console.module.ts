import { Module } from '@nestjs/common';
import { GoogleSearchConsoleController } from './google-search-console.controller';
import { GoogleSearchConsoleService } from './google-search-console.service';

@Module({
  controllers: [GoogleSearchConsoleController],
  providers: [GoogleSearchConsoleService],
  exports: [GoogleSearchConsoleService],
})
export class GoogleSearchConsoleModule {}
