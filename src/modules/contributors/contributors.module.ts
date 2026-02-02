import { Module } from '@nestjs/common';
import { ContributorsService } from './contributors.service';

@Module({
  controllers: [],
  providers: [ContributorsService],
})
export class ContributorsModule {}
