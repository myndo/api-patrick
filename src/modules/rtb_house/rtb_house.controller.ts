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

  /// Verify the token issued by our platform and extract RTB House credentials
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
    if (userId) {
      const stored = await this.integrationTokenService.getToken(
        userId,
        'rtbhouse',
      );

      if (stored && !stored.isExpired) {
        if (stored.metadata?.username && stored.metadata?.password) {
          return {
            username: stored.metadata.username,
            password: stored.metadata.password,
          };
        }

        return this.verifyRtbHousePlatformToken(stored.accessToken);
      }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);
      return this.verifyRtbHousePlatformToken(accessToken);
    }

    throw new HttpException(
      'Missing valid RTB House credentials. Provide userId with stored credentials or Authorization: Bearer <accessToken>.',
      HttpStatus.UNAUTHORIZED,
    );
  }

  /** Login with username/password to get local platform authorization token */
  @Post(`/users/register`)
  async login(@Res() res, @Body() body: LoginRTBHouseDto) {
    try {
      const { username, password } = body;

      if (!username || !password) {
        throw new HttpException(
          'Missing required fields: username, password',
          HttpStatus.BAD_REQUEST,
        );
      }

      const accessToken = this.createRtbHousePlatformToken(username, password);
      const setupResult = await this.jobsService.loginAndSetup(
        username,
        password,
        accessToken,
      );

      return reply({
        res,
        results: {
          user_id: setupResult.user.id,
          id: setupResult.providerProfile.id,
          message:
            'Login successful. Advertiser client info fetched, user/provider profile saved, and credentials stored in IntegrationToken.',
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

  /** Get TradeDoubler job status by jobId */
  @Get(`/jobs/status`)
  async get_Job_Status(@Res() res, @Query('job_Id') jobId: string) {
    try {
      if (!jobId) {
        throw new HttpException(
          'Missing required query param: jobId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.jobsService.getJobStatus(jobId);

      return reply({
        res,
        results: {
          message: 'TradeDoubler job status fetched successfully',
          data,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch TradeDoubler job status',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get RTBHouse saved data by jobId */
  @Get(`/jobs/data`)
  async find_All(
    @Res() res,
    @Headers('authorization') authHeader: string,
    @Query('job_Id') jobId: string,
    @Query('userId') userId?: string,
  ) {
    try {
      if (!jobId) {
        throw new HttpException(
          'Missing required query param: jobId',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.resolveCredentials(authHeader, userId);

      const jobs = await this.jobsService.findAllByJobId(jobId);

      return reply({
        res,
        results: {
          data: jobs,
          status: HttpStatus.OK,
          message: `RTBHouse job data fetched successfully`,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch RTBHouse job data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get RTBHouse provider profile by userId */
  @Get(`/users/profiles`)
  async get_RtbHouse_Profile(@Res() res, @Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'Missing required query param: userId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const profile = await this.jobsService.getRtbHouseProfileByUserId(userId);

      return reply({
        res,
        results: {
          message: 'RTBHouse provider profile fetched successfully',
          data: profile,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch RTBHouse provider profile',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Fetch RTBHouse data and save to database */
  @Post(`/jobs/create`)
  async fetch_RTBHouse_Data(
    @Res() res,
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: FetchRTBHouseDataDto,
  ) {
    try {
      const { dayFrom, dayTo, userId } = body;

      // Validate required fields
      if (!dayFrom || !dayTo || !userId) {
        throw new HttpException(
          'Missing required fields: dayFrom, dayTo, userId',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.resolveCredentials(authHeader, userId);
      const result = await this.jobsService.createAndQueueRTBHouseJob(body);

      return reply({
        res,
        results: {
          message: 'RTBHouse job queued successfully',
          data: result,
        },
      });
    } catch (error: unknown) {
      // Preserve HttpException status codes
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch RTBHouse data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
