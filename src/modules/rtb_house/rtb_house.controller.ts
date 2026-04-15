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
import { sign } from 'jsonwebtoken';
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

  /** Get RTBHouse job status by jobId */
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
          message: 'RTBHouse job status fetched successfully',
          data,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch RTBHouse job status',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** Get RTBHouse saved data by jobId */
  @Get(`/jobs/data`)
  async find_All(@Res() res, @Query('job_Id') jobId: string) {
    try {
      if (!jobId) {
        throw new HttpException(
          'Missing required query param: jobId',
          HttpStatus.BAD_REQUEST,
        );
      }

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

  /** Queue RTBHouse data job */
  @Post(`/jobs/create`)
  async fetch_RTBHouse_Data(@Res() res, @Body() body: FetchRTBHouseDataDto) {
    try {
      const { dayFrom, dayTo, profileId } = body;

      if (!dayFrom || !dayTo || !profileId) {
        throw new HttpException(
          'Missing required fields: dayFrom, dayTo, profileId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.jobsService.createAndQueueRTBHouseJob(body);

      return reply({
        res,
        results: {
          message: 'RTBHouse job queued successfully',
          data: result,
        },
      });
    } catch (error: unknown) {
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
