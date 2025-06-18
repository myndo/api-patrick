import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [],
  providers: [ProfilesService],
})
export class ProfilesModule {}
