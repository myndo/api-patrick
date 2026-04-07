import { Module } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { IntegrationTokenService } from './integration-token.service';

@Module({
  providers: [IntegrationTokenService, DatabaseService],
  exports: [IntegrationTokenService],
})
export class IntegrationTokenModule {}
