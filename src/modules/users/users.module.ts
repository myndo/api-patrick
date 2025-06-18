import { Module } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { CheckUserService } from './middleware/check-user.service';
import { UsersAuthController } from './users.auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UsersAuthController],
  providers: [UsersService, ProfilesService, CheckUserService],
})
export class UsersModule {}
