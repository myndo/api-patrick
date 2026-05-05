import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ZemantaService } from './zemanta.service';
import { CreateZemantaJobDto } from './zemanta.dto';
import { reply } from '../../app/utils/reply';

@Controller('zemanta')
export class ZemantaController {
  constructor(private readonly zemantaService: ZemantaService) {}

  @Post(`/users/register`)
  async generate_AccessToken(@Res() res) {
    const data = await this.zemantaService.generateAccessToken();
    return reply({
      res,
      results: {
        ...data,
        message:
          'Login successful. Access token generated, Zemanta accounts fetched, user/provider profile saved, and credentials stored in IntegrationToken.',
      },
    });
  }

  @Post(`/jobs/create`)
  async create_Zemanta_Job(
    @Body(new ValidationPipe({ transform: true })) body: CreateZemantaJobDto,
    @Res() res,
  ) {
    const result = await this.zemantaService.createAndQueueZemantaJob(body);

    return reply({
      res,
      results: {
        message: 'Zemanta job queued successfully',
        data: result,
      },
    });
  }

  @Get(`/jobs/status`)
  async get_Job_Status(@Res() res, @Query('job_Id') jobId: string) {
    try {
      if (!jobId) {
        throw new HttpException(
          'Missing required query param: jobId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.zemantaService.getJobStatus(jobId);

      return reply({
        res,
        results: {
          message: 'Zemanta job status fetched successfully',
          data,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch Zemanta job status',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(`/jobs/data`)
  async get_Job_Data(@Res() res, @Query('job_Id') jobId: string) {
    try {
      if (!jobId) {
        throw new HttpException(
          'Missing required query param: jobId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.zemantaService.findAllByJobId(jobId);

      return reply({
        res,
        results: {
          message: 'Zemanta job data fetched successfully',
          data,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch Zemanta job data',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(`/users/profiles`)
  async get_Zemanta_Profiles(@Res() res, @Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'Missing required query param: userId',
          HttpStatus.BAD_REQUEST,
        );
      }

      const profiles =
        await this.zemantaService.getZemantaProfilesByUserId(userId);

      return reply({
        res,
        results: {
          message: 'Zemanta provider profiles fetched successfully',
          data: profiles,
        },
      });
    } catch (error: unknown) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch Zemanta provider profiles',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
