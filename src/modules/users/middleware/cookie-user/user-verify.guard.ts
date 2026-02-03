import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { config } from '../../../../app/config';

@Injectable()
export class UserVerifyGuard extends AuthGuard(config.cookie_access.jwtVerify) {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(
        'Invalid token or expired please try again',
      );
    }

    return super.handleRequest(err, user, context, status);
  }
}
