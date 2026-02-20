import { Module } from '@nestjs/common';
import { GoogleSearchConsoleController } from './google-search-console.controller';
import { GoogleSearchConsoleService } from './google-search-console.service';
import { DatabaseModule } from '../../app/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GoogleSearchConsoleController],
  providers: [GoogleSearchConsoleService],
  exports: [GoogleSearchConsoleService],
})
export class GoogleSearchConsoleModule {}
