import { Module } from '@nestjs/common';
import { UserVerifyStrategy } from './middleware';
import { CheckUserService } from './middleware/check-user.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, CheckUserService, UserVerifyStrategy],
})
export class UsersModule {}
