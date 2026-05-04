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
import { reply } from '../../app/utils/reply';

import { TradeDoublerJobsService } from './tradedoubler.service';
import {
  CreateTradeDoublerJobDto,
  LoginTradeDoublerDto,
} from './tradedoubler.dto';

@Controller('trade_doubler')
export class TradeDoublerController {
  constructor(private readonly jobsService: TradeDoublerJobsService) {}

  /** Login and generate TradeDoubler access + refresh tokens */
  @Post(`/users/register`)
  async login(@Res() res, @Body() body: LoginTradeDoublerDto) {
    try {
      const { username, password } = body;
      const clientId = process.env.TRADEDOUBLER_CLIENT_ID?.trim();
      const secret = process.env.TRADEDOUBLER_SECRET?.trim();

      if (!clientId || !secret) {
        throw new HttpException(
          'Missing TRADEDOUBLER_CLIENT_ID or TRADEDOUBLER_SECRET in environment variables',
          HttpStatus.BAD_REQUEST,
        );
      }

      const encoded = Buffer.from(`${clientId}:${secret}`).toString('base64');
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);

      const { default: axios } = await import('axios');
      const response = await axios.post(
        'https://connect.tradedoubler.com/uaa/oauth/token',
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${encoded}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      const expiresIn = Number(response.data.expires_in);
      const expiresAt = Number.isFinite(expiresIn)
        ? new Date(Date.now() + expiresIn * 1000)
        : undefined;

      let setupResult: {
        user: any;
        account: any;
        providerProfile: any;
      } | null = null;

      if (response.data.access_token) {
        setupResult = await this.jobsService.loginAndSetup(
          response.data.access_token,
          response.data.refresh_token ?? undefined,
          expiresAt,
          response.data.scope ?? undefined,
          clientId,
          secret,
          username,
        );
      }

      return reply({
        res,
        results: {
          id: setupResult?.providerProfile?.id ?? null,
          user_id: setupResult?.user?.id ?? null,
          message:
            'Login successful. User resolved/created, token saved, advertiser account fetched, provider profile updated.',
        },
      });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { error_description?: string } };
        message?: string;
      };

      throw new HttpException(
        axiosError.response?.data?.error_description ||
          axiosError.message ||
          'Failed to authenticate with TradeDoubler',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Get TradeDoubler job status by jobId */
  @Get(`/jobs/status`)
  async get_Job_Status(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Query('job_Id') jobId: string,
  ) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

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

  /** Get TradeDoubler saved data by jobId */
  @Get(`/jobs/data`)
  async get_Job_Data(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Query('job_Id') jobId: string,
  ) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!jobId) {
        throw new HttpException(
          'Missing required query param: jobId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.jobsService.findAllByJobId(jobId);

      return reply({
        res,
        results: {
          message: 'TradeDoubler job data fetched successfully',
          data,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch TradeDoubler job data',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get TradeDoubler provider profile by userId */
  @Get(`/users/profiles`)
  async get_Tradedoubler_Profile(@Res() res, @Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'Missing required query param: userId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const profile =
        await this.jobsService.getTradedoublerProfileByUserId(userId);

      return reply({
        res,
        results: {
          message: 'TradeDoubler provider profile fetched successfully',
          data: profile,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch TradeDoubler provider profile',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Fetch TradeDoubler data and save to database */
  @Post(`/jobs/create`)
  async tradeDoubler_Job_Create(
    @Res() res,
    @Body() body: CreateTradeDoublerJobDto,
  ) {
    try {
      const result = await this.jobsService.createAndRunTradeDoublerJob(body);

      return reply({
        res,
        results: {
          message: 'TradeDoubler job queued successfully',
          data: result,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to execute TradeDoubler job',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
