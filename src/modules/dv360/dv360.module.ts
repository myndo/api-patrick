import { Module } from '@nestjs/common';
import { IntegrationTokenModule } from '../integrations/integration-token.module';
import { Dv360Controller } from './dv360.controller';
import { Dv360Service } from './dv360.service';

@Module({
  imports: [IntegrationTokenModule],
  controllers: [Dv360Controller],
  providers: [Dv360Service],
  exports: [Dv360Service],
})
export class Dv360Module {}
