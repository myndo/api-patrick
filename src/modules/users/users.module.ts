import { Module } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { UserVerifyStrategy } from './middleware';
import { CheckUserService } from './middleware/check-user.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    ProfilesService,
    CheckUserService,
    UserVerifyStrategy,
  ],
})
export class UsersModule {}
