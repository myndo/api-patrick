import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Param,
  Query,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ZemantaService } from './zemanta.service';
import {
  GenerateAccessTokenDto,
  ListAccountsDto,
  ListCampaignsDto,
} from './zemanta.dto';
import { reply } from '../../app/utils/reply';

@Controller('zemanta')
export class ZemantaController {
  constructor(private readonly zemantaService: ZemantaService) {}

  /**
   * Generate access token to pass as Authorization header
   * POST /api/v1/zemanta/access-token
   */
  @Post('access-token')
  async generate_AccessToken(
    @Body(new ValidationPipe({ transform: true })) body: GenerateAccessTokenDto,
    @Res() res,
  ) {
    const data = await this.zemantaService.generateAccessToken(body);
    return reply({
      res,
      results: {
        ...data,
        message: 'Access token generated successfully',
      },
    });
  }

  /**
   * Get all campaigns from database
   * GET /api/v1/zemanta/find-all
   * Query params (optional): statsFrom (YYYY-MM-DD), statsTo (YYYY-MM-DD)
   */
  @Get('find-all')
  async find_All(
    @Query('statsFrom') statsFrom?: string,
    @Query('statsTo') statsTo?: string,
    @Res() res?,
  ) {
    const data = await this.zemantaService.getAllCampaignsFromDatabase(
      statsFrom,
      statsTo,
    );
    return reply({
      res,
      results: {
        ...data,
        message: 'Campaigns retrieved successfully from database',
      },
    });
  }

  /**
   * List all accounts
   * GET /api/v1/zemanta/accounts
   */
  @Get('accounts')
  async list_Accounts(
    @Query(new ValidationPipe({ transform: true })) query: ListAccountsDto,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    const data = await this.zemantaService.listAccounts(
      query.includeArchived,
      query.includeDeliveryStatus,
      authorization,
    );
    return reply({
      res,
      results: {
        ...data,
        message: 'Accounts retrieved successfully',
      },
    });
  }

  /**
   * Get account details
   * GET /api/v1/zemanta/accounts/:accountId
   */
  @Get('accounts/:accountId')
  async get_AccountDetails(
    @Param('accountId') accountId: string,
    @Query('includeDeliveryStatus') includeDeliveryStatus: boolean,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    const data = await this.zemantaService.getAccountDetails(
      accountId,
      includeDeliveryStatus,
      authorization,
    );
    return reply({
      res,
      results: {
        ...data,
        message: 'Account details retrieved successfully',
      },
    });
  }

  /**
   * List campaigns
   * GET /api/v1/zemanta/campaigns
   */
  @Get('campaigns')
  async list_Campaigns(
    @Query(new ValidationPipe({ transform: true })) query: ListCampaignsDto,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    const data = await this.zemantaService.listCampaigns(query, authorization);
    return reply({
      res,
      results: {
        ...data,
        message: 'Campaigns retrieved successfully',
      },
    });
  }

  /**
   * Get campaign details (budgets and optionally stats)
   * GET /api/v1/zemanta/campaigns/:campaignId
   * Query params: from (optional), to (optional) - if provided, includes stats
   */
  @Get('campaigns/:campaignId')
  async get_CampaignDetails(
    @Param('campaignId') campaignId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Headers('authorization') authorization?: string,
    @Res() res?,
  ) {
    const result = await this.zemantaService.getCampaignDetails(
      campaignId,
      from,
      to,
      authorization,
    );
    return reply({
      res,
      results: {
        ...result,
        message: 'Campaign details retrieved successfully',
      },
    });
  }

  /**
   * Sync all campaigns to database
   * POST /api/v1/zemanta/sync-campaigns
   * Query params: from (required), to (required) - date range for stats
   */
  @Post('sync-campaigns')
  async sync_Campaigns(
    @Query('from') from: string,
    @Query('to') to: string,
    @Headers('authorization') authorization: string,
    @Res() res,
  ) {
    if (!from || !to) {
      return reply({
        res,
        results: {
          error:
            'from and to query parameters are required (YYYY-MM-DD format)',
        },
      });
    }

    const data = await this.zemantaService.syncCampaignsToDatabase(
      from,
      to,
      authorization,
    );
    return reply({
      res,
      results: data,
    });
  }
}
