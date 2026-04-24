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
import { AdformService } from './adform.service';
import { FetchAdformStatsDto } from './adform.dto';

@Controller('adform')
export class AdformController {
  constructor(private readonly adformService: AdformService) {}

  @Get('/campaigns')
  async getCampaigns(@Res() res) {
    try {
      const result = await this.adformService.getCampaigns();
      return reply({ res, results: result });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/stats')
  async getStats(@Res() res, @Body() body: FetchAdformStatsDto) {
    try {
      const result = await this.adformService.getStats(body);
      return reply({ res, results: result });
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
