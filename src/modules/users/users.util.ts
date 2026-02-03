import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { config } from '../../app/config/index';
import {
  Contributor,
  ContributorStatusEnum,
  Profile,
} from '../../app/database/prisma';
import { ContributorsService } from '../contributors/contributors.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProfilesService } from '../profiles/profiles.service';
import {
  CheckUserService,
  TokenJwtModel,
} from './middleware/check-user.service';
import { UsersService } from './users.service';

@Injectable()
export class UsersUtil {
  constructor(
    private readonly usersService: UsersService,
    private readonly checkUserService: CheckUserService,
    private readonly profilesService: ProfilesService,
    private readonly organizationsService: OrganizationsService,
    private readonly contributorsService: ContributorsService,
  ) {}

  async saveOrUpdate({
    email,
    role,
    image,
    provider,
    password,
    firstName,
    lastName,
    username,
    confirmedAt,
    organizationName,
  }: {
    status: Contributor['status'];
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    currency?: string;
    phone?: string;
    confirmedAt: Date;
    organizationName?: string;
    image?: Profile['image'];
    role: Contributor['role'];
    email_verified?: boolean;
    provider?: 'DEFAULT' | 'PROVIDER';
  }): Promise<any> {
    /** Create User */
    const user = await this.usersService.createOne({
      provider,
      password,
      confirmedAt,
      email: email?.toLowerCase(),
    });
    /** Create Organization */
    const organization = await this.organizationsService.createOne({
      slug: username,
      user: {
        connect: {
          id: user?.id,
        },
      },
      email: email?.toLowerCase(),
      name: organizationName ? organizationName : `${firstName} ${lastName}`,
    });

    /** Create Profile */
    await this.profilesService.createOne({
      lastName,
      firstName,
      image,
      user: {
        connect: {
          id: user?.id,
        },
      },
    });

    /** Create Subscribe */
    const contributor = await this.contributorsService.createOne({
      role: role,
      user: {
        connect: {
          id: user?.id,
        },
      },
      userCreatedId: user?.id,
      confirmedAt: user?.confirmedAt,
      organization: {
        connect: {
          id: organization?.id,
        },
      },
      status: ContributorStatusEnum.CONTRIBUTOR,
    });

    /** Update Organization */
    await this.usersService.updateOne(
      { userId: user?.id },
      { organizationId: organization?.id },
    );

    return { user, contributor };
  }

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
    const organization = await this.organizationsService.findOneBy({
      organizationId: organizationId,
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
