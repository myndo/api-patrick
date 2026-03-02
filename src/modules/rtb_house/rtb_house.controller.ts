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
import { reply } from '../../app/utils/reply';

import { JobsService } from './rtb_house.service';
import { FetchRTBHouseDataDto } from './rtb_house.dto';

@Controller('rtbhouse')
export class RtbHouseController {
  constructor(private readonly jobsService: JobsService) {}

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
      if (!dayFrom || !dayTo) {
        throw new HttpException(
          'Missing required fields: dayFrom, dayTo',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!authHeader) {
        throw new HttpException(
          'Missing Authorization header with username:password in Basic auth format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Extract credentials from "Basic <base64(username:password)>" format
      if (!authHeader.startsWith('Basic ')) {
        throw new HttpException(
          'Authorization header must use Basic auth format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const base64Credentials = authHeader.slice(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'utf-8',
      );
      const [username, password] = credentials.split(':');

      if (!username || !password) {
        throw new HttpException(
          'Invalid Basic auth credentials format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.jobsService.fetchAndSaveRTBHouseData(dayFrom, dayTo, {
        baseUrl: 'https://api.rtbhouse.com',
        advertiserId: advertiserId || '',
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
