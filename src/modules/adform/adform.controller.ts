import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import { AdformService } from './adform.service';
import {
  CreateAdformJobDto,
  FetchAdformStatsDto,
  LoginAdformDto,
} from './adform.dto';

@Controller('adform')
export class AdformController {
  constructor(private readonly adformService: AdformService) {}

  @Post(`/users/register`)
  async login(@Res() res, @Body() body: LoginAdformDto) {
    try {
      const result = await this.adformService.loginAndSetup(body);

      return reply({
        res,
        results: {
          user_id: result.user.id,
          id: result.providerProfile.id,
          message:
            'Login successful. User, provider profile, and integration token were saved successfully.',
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to authenticate with Adform',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get(`/users/profiles`)
  async get_Adform_Profile(@Res() res, @Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'Missing required query param: userId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const profile = await this.adformService.getAdformProfileByUserId(userId);

      return reply({
        res,
        results: {
          message: 'Adform provider profile fetched successfully',
          data: profile,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch Adform provider profile',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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

  @Post('/jobs/create')
  async adform_Job_Create(@Res() res, @Body() body: CreateAdformJobDto) {
    try {
      const result = await this.adformService.createAdformJob(body);

      return reply({
        res,
        results: {
          message: 'Adform job queued successfully',
          data: result,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to create Adform job',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
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
