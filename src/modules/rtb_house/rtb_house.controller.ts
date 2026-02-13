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
  async fetch_RTBHouse_Data(@Res() res, @Body() body: FetchRTBHouseDataDto) {
    try {
      const { dayFrom, dayTo, baseUrl, advertiserId, username, password } =
        body;

      // Validate required fields
      if (
        !dayFrom ||
        !dayTo ||
        !baseUrl ||
        !advertiserId ||
        !username ||
        !password
      ) {
        throw new HttpException(
          'Missing required fields: dayFrom, dayTo, baseUrl, advertiserId, username, password',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.jobsService.fetchAndSaveRTBHouseData(dayFrom, dayTo, {
        baseUrl,
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
