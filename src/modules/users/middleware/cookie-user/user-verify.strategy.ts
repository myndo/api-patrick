import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../../../app/config';
import { UsersService } from '../../users.service';
import { TokenJwtModel } from '../check-user.service';

@Injectable()
export class UserVerifyStrategy extends PassportStrategy(
  Strategy,
  config.cookie_access.jwtVerify,
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        UserVerifyStrategy.extractJwt,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.cookieKey,
    });
  }

  private static extractJwt(req: Request): string | null {
    if (
      req.cookies &&
      config.cookie_access.nameVerify in req.cookies &&
      req.cookies[config.cookie_access.nameVerify].length > 0
    ) {
      return req.cookies[config.cookie_access.nameVerify];
    }
    return null;
  }

  async validate(payload: TokenJwtModel) {
    const user = await this.usersService.findOneBy({ userId: payload?.userId });
    if (!user) throw new UnauthorizedException('Invalid user');

    return user;
  }
}
