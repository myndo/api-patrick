import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { config } from '../../app/config/index';
import {
  CheckUserService,
  TokenJwtModel,
} from './middleware/check-user.service';
import { JobsService } from '../rtb_house/rtb_house.service';

@Injectable()
export class UsersUtil {
  constructor(
    private readonly checkUserService: CheckUserService,
    private readonly jobsService: JobsService,
  ) {}

  async createTokenLogin({
    userId,
    email,
    currency,
    organizationId,
    userPointOfSaleId,
    pointOfSaleId,
  }: {
    userId: string;
    email?: string;
    currency?: string;
    organizationId: string;
    pointOfSaleId?: string;
    userPointOfSaleId?: string;
  }): Promise<string> {
    const tokenUser = await this.checkUserService.createTokenCookie(
      {
        email,
        userId,
        currency,
        organizationId,
        userPointOfSaleId,
        pointOfSaleId,
      } as TokenJwtModel,
      config.cookie_access.accessExpire,
    );

    return tokenUser;
  }

  async findOneUserLogin({
    organizationId,
  }: {
    organizationId: string;
    userPointOfSaleId: string;
  }): Promise<any> {
    const organization = await this.jobsService.findOneBy({
      jobId: organizationId,
    });
    if (!organization) throw new UnauthorizedException('User invalid');

    return organization;
  }

  async verifyTokenMiddleware({
    token,
    code,
    email,
  }: {
    token: string;
    code: string;
    email: string;
  }): Promise<any> {
    if (!token) {
      throw new HttpException(`Token invalid or expired`, HttpStatus.NOT_FOUND);
    }

    const payload = await this.checkUserService.verifyTokenCookie(token);
    if (payload?.code !== code || payload?.email !== email) {
      throw new HttpException(
        `6-digit code invalid or expired try to resend code`,
        HttpStatus.NOT_FOUND,
      );
    }

    return payload;
  }
}
