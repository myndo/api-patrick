import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import {
  ExchangeDv360CodeDto,
  ListDv360AdvertisersDto,
  ListDv360CampaignsDto,
  ListDv360PartnersDto,
} from './dv360.dto';
import { Dv360Service } from './dv360.service';

@Controller('dv360')
export class Dv360Controller {
  constructor(private readonly dv360Service: Dv360Service) {}

  @Get('auth-url')
  async get_Auth_Url(@Query('redirectUri') redirectUri: string, @Res() res) {
    const data = this.dv360Service.generateAuthUrl(redirectUri);
    return reply({
      res,
      results: {
        ...data,
        status: HttpStatus.OK,
        message: 'DV360 authorization URL fetched successfully',
      },
    });
  }

  @Get('redirect')
  async oauth_Redirect(
    @Query('code') code: string,
    @Query('redirectUri') redirectUri: string,
    @Res() res,
  ) {
    const data = await this.dv360Service.exchangeCode({ code, redirectUri });
    return reply({
      res,
      results: {
        ...data,
        status: HttpStatus.OK,
        message: 'DV360 tokens fetched successfully',
      },
    });
  }

  @Post('exchange-code')
  async exchange_Code(
    @Body(new ValidationPipe({ transform: true })) body: ExchangeDv360CodeDto,
    @Res() res,
  ) {
    const data = await this.dv360Service.exchangeCode(body);
    return reply({
      res,
      results: {
        ...data,
        status: HttpStatus.OK,
        message: 'DV360 code exchanged successfully',
      },
    });
  }

  @Get('partners')
  async list_Partners(
    @Query(new ValidationPipe({ transform: true })) query: ListDv360PartnersDto,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    const data = await this.dv360Service.listPartners(
      query.pageSize,
      authorization,
    );

    return reply({
      res,
      results: {
        data,
        status: HttpStatus.OK,
        message: 'DV360 partners fetched successfully',
      },
    });
  }

  @Get('advertisers')
  async list_Advertisers(
    @Query(new ValidationPipe({ transform: true }))
    query: ListDv360AdvertisersDto,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    const data = await this.dv360Service.listAdvertisers(
      query.partnerId,
      query.pageSize,
      authorization,
    );

    return reply({
      res,
      results: {
        data,
        status: HttpStatus.OK,
        message: 'DV360 advertisers fetched successfully',
      },
    });
  }

  @Get('campaigns')
  async list_Campaigns(
    @Query(new ValidationPipe({ transform: true }))
    query: ListDv360CampaignsDto,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    const data = await this.dv360Service.listCampaigns(
      query.advertiserId,
      query.pageSize,
      authorization,
    );

    return reply({
      res,
      results: {
        data,
        status: HttpStatus.OK,
        message: 'DV360 campaigns fetched successfully',
      },
    });
  }
}
