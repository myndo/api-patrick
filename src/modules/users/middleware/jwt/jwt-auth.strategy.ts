import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../../../app/config';
import { UsersUtil } from '../../users.util';
import { TokenJwtModel } from '../check-user.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersUtil: UsersUtil) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.cookieKey,
    });
  }

  async validate(payload: TokenJwtModel) {
    const user = await this.usersUtil.findOneUserLogin({
      organizationId: payload?.organizationId,
      userPointOfSaleId: payload?.userPointOfSaleId,
    });

    return { ...user };
  }
}
