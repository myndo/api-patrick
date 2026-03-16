import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { TradeDoublerJobsService } from './tradedoubler.service';
import {
  FetchTradeDoublerDataDto,
  LoginTradeDoublerDto,
} from './tradedoubler.dto';

@Controller('trade_doubler')
export class TradeDoublerController {
  constructor(private readonly jobsService: TradeDoublerJobsService) {}

  /** Login and generate TradeDoubler access + refresh tokens */
  @Post(`/auth/login`)
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

      return reply({
        res,
        results: {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
          tokenType: response.data.token_type,
          message: 'Login successful',
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

  /** Get all jobs */
  @Get(`/jobs/data`)
  async find_All(@Res() res) {
    const jobs = await this.jobsService.findAll();

    return reply({
      res,
      results: {
        data: jobs,
        status: HttpStatus.OK,
        message: `Jobs fetched successfully`,
      },
    });
  }

  /** Fetch TradeDoubler data and save to database */
  @Post(`/jobs/create`)
  async fetch_TradeDoubler_Data(
    @Res() res,
    @Body() body: FetchTradeDoublerDataDto,
  ) {
    try {
      const { dateFrom, dateTo } = body;

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
