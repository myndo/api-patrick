import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadsUtil } from './uploads.util';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadsUtil],
})
export class UploadsModule {}
