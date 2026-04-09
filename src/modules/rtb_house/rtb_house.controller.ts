import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../../app/config';
import { reply } from '../../app/utils/reply';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import { JobsService } from './rtb_house.service';
import { FetchRTBHouseDataDto, LoginRTBHouseDto } from './rtb_house.dto';

@Controller('rtbhouse')
export class RtbHouseController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly integrationTokenService: IntegrationTokenService,
  ) {}

  private createRtbHousePlatformToken(username: string, password: string) {
    return sign(
      {
        type: 'rtbhouse-platform-auth',
        username,
        password,
      },
      config.cookieKey,
      { expiresIn: '30d' },
    );
  }

  private verifyRtbHousePlatformToken(token: string): {
    username: string;
    password: string;
  } {
    const payload = verify(token, config.cookieKey);

    if (typeof payload === 'string') {
      throw new HttpException(
        'Invalid authorization token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      payload?.type !== 'rtbhouse-platform-auth' ||
      !payload?.username ||
      !payload?.password
    ) {
      throw new HttpException(
        'Invalid authorization token payload',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      username: String(payload.username),
      password: String(payload.password),
    };
  }

  private async resolveCredentials(
    authHeader?: string,
    userId?: string,
  ): Promise<{ username: string; password: string }> {
    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);
      return this.verifyRtbHousePlatformToken(accessToken);
    }

    if (!userId) {
      throw new HttpException(
        'Missing Authorization header. Use Bearer <accessToken> or provide userId with stored RTB House credentials.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const stored = await this.integrationTokenService.getToken(
      userId,
      'rtbhouse',
    );
    if (!stored) {
      throw new HttpException(
        `No stored RTB House credentials found for userId=${userId}. Login first using /rtbhouse/auth/login.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (stored.isExpired) {
      throw new HttpException(
        'Stored RTB House credentials expired. Please login again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (stored.metadata?.username && stored.metadata?.password) {
      return {
        username: stored.metadata.username,
        password: stored.metadata.password,
      };
    }

    return this.verifyRtbHousePlatformToken(stored.accessToken);
  }

  /** Login with username/password to get local platform authorization token */
  @Post(`/auth/login`)
  async login(@Res() res, @Body() body: LoginRTBHouseDto) {
    try {
      const { username, password, userId } = body;

      if (!username || !password) {
        throw new HttpException(
          'Missing required fields: username, password',
          HttpStatus.BAD_REQUEST,
        );
      }

      const accessToken = this.createRtbHousePlatformToken(username, password);

      if (userId) {
        await this.integrationTokenService.saveToken(userId, 'rtbhouse', {
          accessToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          metadata: {
            username,
            password,
          },
        });
      }

      return reply({
        res,
        results: {
          accessToken,
          message:
            'Login successful. Use this token in Authorization header: Bearer <accessToken>',
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to create RTBHouse authorization token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Get all jobs */
  @Get(`/jobs/data`)
  async find_All(
    @Res() res,
    @Headers('authorization') authHeader: string,
    @Query('userId') userId?: string,
  ) {
    try {
      await this.resolveCredentials(authHeader, userId);

      const jobs = await this.jobsService.findAll();

      return reply({
        res,
        results: {
          data: jobs,
          status: HttpStatus.OK,
          message: `RTBHouse data fetched successfully`,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch RTBHouse data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Fetch RTBHouse data and save to database */
  @Post(`/jobs/create`)
  async fetch_RTBHouse_Data(
    @Res() res,
    @Headers('authorization') authHeader: string,
    @Body() body: FetchRTBHouseDataDto,
  ) {
    try {
      const { dayFrom, dayTo, advertiserId, userId } = body;

      // Validate required fields
      if (!dayFrom || !dayTo || !advertiserId) {
        throw new HttpException(
          'Missing required fields: dayFrom, dayTo, advertiserId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { username, password } = await this.resolveCredentials(
        authHeader,
        userId,
      );

      await this.jobsService.fetchAndSaveRTBHouseData(dayFrom, dayTo, {
        baseUrl: 'https://api.panel.rtbhouse.com/v5',
        advertiserId,
        username,
        password,
      });

      return reply({
        res,
        results: {
          message: 'RTBHouse data fetched and saved successfully',
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch RTBHouse data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
