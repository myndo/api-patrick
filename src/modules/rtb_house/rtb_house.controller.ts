import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../../app/config';
import { reply } from '../../app/utils/reply';

import { JobsService } from './rtb_house.service';
import { FetchRTBHouseDataDto, LoginRTBHouseDto } from './rtb_house.dto';

@Controller('rtbhouse')
export class RtbHouseController {
  constructor(private readonly jobsService: JobsService) {}

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

  /** Login with username/password to get local platform authorization token */
  @Post(`/auth/login`)
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

      return reply({
        res,
        results: {
          accessToken,
          message:
            'Login successful. Use this token in Authorization header: Bearer <accessToken>',
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create RTBHouse authorization token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Get all jobs */
  @Get(`/jobs/data`)
  async find_All(@Res() res, @Headers('authorization') authHeader: string) {
    try {
      if (!authHeader) {
        throw new HttpException(
          'Missing Authorization header. Use Bearer <accessToken> format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const jobs = await this.jobsService.findAll();

      return reply({
        res,
        results: {
          data: jobs,
          status: HttpStatus.OK,
          message: `RTBHouse data fetched successfully`,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch RTBHouse data',
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
      const { dayFrom, dayTo, advertiserId } = body;

      // Validate required fields
      if (!dayFrom || !dayTo || !advertiserId) {
        throw new HttpException(
          'Missing required fields: dayFrom, dayTo, advertiserId',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException(
          'Missing or invalid Authorization header. Use Bearer <accessToken> format. Get token from POST /rtbhouse/auth/login',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const accessToken = authHeader.slice(7);
      const { username, password } =
        this.verifyRtbHousePlatformToken(accessToken);

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
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch RTBHouse data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
