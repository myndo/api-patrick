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
  FetchTradeDoublerDataDto,
  LoginTradeDoublerDto,
} from './tradedoubler.dto';

@Controller('trade_doubler')
export class TradeDoublerController {
  constructor(private readonly jobsService: TradeDoublerJobsService) {}

  /** Login and generate TradeDoubler access + refresh tokens */
  @Post(`/users/register`)
  async login(@Res() res, @Body() body: LoginTradeDoublerDto) {
    try {
      const { username, password, clientId, secret } = body;

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
          accessToken: response.data.access_token,
          id: setupResult?.providerProfile?.id ?? null,
          user_id: setupResult?.user?.id ?? null,
          message:
            'Login successful. User resolved/created, token saved, advertiser account fetched, provider profile updated.',
        },
      });
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error_description ||
          error.message ||
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
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler job status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler job data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get TradeDoubler advertiser account */
  @Get(`/advertiser/account`)
  async get_Advertiser_Account(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Query('userId') userId?: string,
  ) {
    try {
      const result = await this.jobsService.fetchAdvertiserAccount(
        userId,
        authorization,
      );

      return reply({
        res,
        results: {
          message: 'TradeDoubler advertiser account fetched successfully',
          data: result,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler advertiser account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get TradeDoubler provider profile by userId */
  @Get(`/users/profiles`)
  async get_Tradedoubler_Profile(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

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
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler provider profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get TradeDoubler statistics report */
  @Get(`/report/statistics`)
  async get_Statistics_Report(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('userId') userId?: string,
  ) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!dateFrom || !dateTo) {
        throw new HttpException(
          'Missing required query params: dateFrom, dateTo',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.jobsService.fetchStatisticsReport(
        dateFrom,
        dateTo,
        userId,
        authorization,
      );

      return reply({
        res,
        results: {
          message: 'TradeDoubler statistics report fetched successfully',
          data,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler statistics report',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get TradeDoubler transactions report */
  @Get(`/report/transactions`)
  async get_Transactions_Report(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('userId') userId?: string,
  ) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!dateFrom || !dateTo) {
        throw new HttpException(
          'Missing required query params: dateFrom, dateTo',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.jobsService.fetchTransactionsReport(
        dateFrom,
        dateTo,
        userId,
        authorization,
      );

      return reply({
        res,
        results: {
          message: 'TradeDoubler transactions report fetched successfully',
          data,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler transactions report',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Fetch TradeDoubler data and save to database */
  @Post(`/jobs/request`)
  async request_TradeDoubler_Job(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Body() body: CreateTradeDoublerJobDto,
  ) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.jobsService.createAndRunTradeDoublerJob(
        body,
        authorization,
      );

      return reply({
        res,
        results: {
          message: 'TradeDoubler job executed successfully',
          data: result,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to execute TradeDoubler job',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Fetch TradeDoubler data and save to database */
  @Post(`/jobs/create`)
  async fetch_TradeDoubler_Data(
    @Res() res,
    @Headers('authorization') authorization: string,
    @Body() body: FetchTradeDoublerDataDto,
  ) {
    try {
      const { dateFrom, dateTo, userId } = body;

      // Validate required fields
      if (!dateFrom || !dateTo) {
        throw new HttpException(
          'Missing required fields: dateFrom, dateTo',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.jobsService.fetchAndSaveTradeDoublerData(
        dateFrom,
        dateTo,
        userId,
        authorization,
      );

      return reply({
        res,
        results: {
          message: 'TradeDoubler data fetched and saved successfully',
          data: result,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch TradeDoubler data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
