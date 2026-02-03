import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';

import { config } from '../../app/config';
import { generateNumber, Slug } from '../../app/utils/commons';
import {
  validation_login_cookie_setting,
  validation_verify_cookie_setting,
} from '../../app/utils/cookies';
import { reply } from '../../app/utils/reply';
import { ContributorsService } from '../contributors/contributors.service';
import { ProfilesService } from '../profiles/profiles.service';
import { authCodeConfirmationMail } from './mails/auth-code-confirmation-mail';
import {
  CheckUserService,
  TokenJwtModel,
} from './middleware/check-user.service';
import { Cookies } from './middleware/cookie.guard';
import {
  ConfirmEmailUserDto,
  CreateLoginUserDto,
  RegisterUserDto,
  ResetPasswordUserDto,
  UpdateResetPasswordUserDto,
  verifyTokenDto,
} from './users.dto';
import { UsersService } from './users.service';
import { checkIfPasswordMatch, hashPassword } from './users.type';

@Controller()
export class UsersAuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly contributorsService: ContributorsService,
    private readonly checkUserService: CheckUserService,
  ) {}

  /** Post one User */
  @Post(`/register`)
  async createOne(@Res() res, @Body() body: RegisterUserDto) {
    const { email, password, firstName, lastName, country } = body;

    const findOneUser = await this.usersService.findOneBy({ email });
    if (findOneUser)
      throw new HttpException(
        `Email ${email} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const user = await this.usersService.createOne({
      password: await hashPassword(password),
      provider: 'default',
      email: email.toLocaleLowerCase(),
      organization: {
        create: {
          name: `${firstName} ${lastName}`,
          slug: Slug(`${firstName} ${lastName}-${generateNumber(4)}`),
          description: country,
        },
      },
    });

    const profile = await this.profilesService.createOne({
      lastName,
      firstName,
      user: {
        connect: {
          id: user.id,
        },
      },
    });

    // await this.contributorsService.createOne({
    //   description: country,
    //   status: ContributorStatusEnum.CONTRIBUTOR,
    //   user: {
    //     connect: {
    //       id: user.id,
    //     },
    //   },
    //   organization: {
    //     connect: {
    //       id: user.organizationId,
    //     },
    //   },
    // });

    await this.profilesService.updateOne(
      { profileId: profile?.id },
      { address: country },
    );

    const codeGenerate = generateNumber(6);
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: user?.id, code: codeGenerate } as TokenJwtModel,
      config.cookie_access.accessExpire,
    );

    res.cookie(
      config.cookie_access.nameVerify,
      tokenUser,
      validation_verify_cookie_setting,
    );

    await authCodeConfirmationMail({ email: user?.email, code: codeGenerate });

    return reply({ res, results: { token: tokenUser } });
  }

  /** Resend user code */
  @Get(`/resend-code`)
  async resendCode(@Res() res, @Cookies() cookies) {
    const token = cookies[config.cookie_access.nameVerify];

    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const codeGenerate = generateNumber(6);
    const payload = await this.checkUserService.verifyTokenCookie(token);
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: payload?.userId, code: codeGenerate } as TokenJwtModel,
      config.cookie_access.accessExpire,
    );
    const findOneUser = await this.usersService.findOneBy({
      userId: payload?.userId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    res.cookie(
      config.cookie_access.nameVerify,
      tokenUser,
      validation_verify_cookie_setting,
    );

    await authCodeConfirmationMail({
      email: findOneUser?.email,
      code: codeGenerate,
    });

    return reply({ res, results: 'Code resend' });
  }

  /** Confirm email */
  @Post(`/confirm-email`)
  async confirmEmail(
    @Res() res,
    @Req() req,
    @Headers('origin') origin: string,
    @Body() body: ConfirmEmailUserDto,
    @Cookies() cookies,
  ) {
    const { user } = req;
    const { code } = body;
    const token = cookies[config.cookie_access.nameVerify];
    if (!token)
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );

    const payload = await this.checkUserService.verifyTokenCookie(token);

    if (Number(payload?.code) !== Number(code)) {
      throw new HttpException(
        `Code ${code} invalid or expired try to resend`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.usersService.updateOne(
      { userId: payload?.userId },
      { confirmedAt: new Date() },
    );
    const tokenUser = await this.checkUserService.createTokenCookie(
      { userId: payload?.userId },
      config.cookie_access.accessExpire,
    );
    res.cookie(
      config.cookie_access.nameLogin,
      tokenUser,
      validation_login_cookie_setting,
    );

    return reply({
      res,
      results: {
        url: origin,
        assignTypes: user?.organization?.assignTypes,
        message: 'Email Confirmed Successfully',
      },
    });
  }

  /** Login user */
  @Post(`/login`)
  async createOneLogin(
    @Res() res,
    @Body() body: CreateLoginUserDto,
    @Headers('origin') origin: string,
  ) {
    const { email, password } = body;

    const findOneUser = await this.usersService.findOneBy({
      email,
      provider: 'default',
    });
    if (!findOneUser)
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);
    if (!(await checkIfPasswordMatch(findOneUser?.password, password)))
      throw new HttpException(`Invalid credentials`, HttpStatus.NOT_FOUND);

    const codeGenerate = generateNumber(6);

    if (!findOneUser?.confirmedAt) {
      const tokenUserVerify = await this.checkUserService.createTokenCookie(
        { userId: findOneUser?.id, code: codeGenerate },
        config.cookie_access.accessExpire,
      );
      res.cookie(
        config.cookie_access.nameVerify,
        tokenUserVerify,
        validation_verify_cookie_setting,
      );

      await authCodeConfirmationMail({
        email: findOneUser.email,
        code: codeGenerate,
      });
    } else {
      const tokenUser = await this.checkUserService.createTokenCookie(
        { userId: findOneUser.id },
        config.cookie_access.accessExpire,
      );

      res.cookie(
        config.cookie_access.nameLogin,
        tokenUser,
        validation_login_cookie_setting,
      );
    }

    return reply({
      res,
      results: {
        message: 'User logged in successfully',
        url: origin,
        confirmedAt: findOneUser?.confirmedAt,
      },
    });
  }

  /** Reset password user */
  @Post(`/password/reset`)
  async resetPassword(@Res() res, @Body() body: ResetPasswordUserDto) {
    const { email } = body;

    const findOneUser = await this.usersService.findOneBy({
      email,
      provider: 'default',
    });
    if (!findOneUser)
      throw new HttpException(
        `User email ${email} invalid`,
        HttpStatus.NOT_FOUND,
      );

    const token = await this.checkUserService.createTokenCookie(
      { userId: findOneUser.id },
      config.cookie_access.accessExpire,
    );

    // await authPasswordResetMail({ email, token, urlOrigin: origin });

    return reply({ res, results: token });
  }

  /** Password reset token */
  @Put(`/password/update/:token`)
  async updatePassword(@Res() res, @Body() body: UpdateResetPasswordUserDto) {
    const { password, token } = body;

    const payload = await this.checkUserService.verifyTokenCookie(token);
    const findOneUser = await this.usersService.findOneBy({
      userId: payload?.userId,
    });
    if (!findOneUser)
      throw new HttpException(`User  invalid`, HttpStatus.NOT_FOUND);
    await this.usersService.updateOne(
      { userId: findOneUser?.id },
      { password: await hashPassword(password) },
    );

    return reply({ res, results: 'Password updated' });
  }

  /** Verify token */
  @Get(`/verify/:token`)
  async verifyToken(@Res() res, @Param() param: verifyTokenDto) {
    const { token } = param;
    if (!token) {
      throw new HttpException(
        `Token not valid please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const payload = await this.checkUserService.verifyTokenCookie(token);
    const findOneUser = await this.usersService.findOneBy({
      userId: payload?.userId,
    });
    if (!findOneUser)
      throw new HttpException(
        `User doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    // if (findOneContributor?.confirmedAt !== null)
    //   throw new HttpException(`Invitation already confirmed`, HttpStatus.FOUND);

    return reply({
      res,
      results: {
        ...payload,
        user: findOneUser,
      },
    });
  }

  /** Logout user */
  @Get(`/logout`)
  async logout(@Res() res) {
    res.clearCookie(
      config.cookie_access.nameLogin,
      validation_login_cookie_setting,
    );
    res.clearCookie(
      config.cookie_access.nameVerify,
      validation_verify_cookie_setting,
    );

    return reply({ res, results: 'User logout successfully' });
  }
}
