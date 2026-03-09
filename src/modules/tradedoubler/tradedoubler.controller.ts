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
import { FetchTradeDoublerDataDto } from './tradedoubler.dto';

@Controller('trade_doubler')
export class TradeDoublerController {
  constructor(private readonly jobsService: TradeDoublerJobsService) {}

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
