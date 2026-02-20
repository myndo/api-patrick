import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ZemantaService } from './zemanta.service';
import {
  ListAccountsDto,
  UpdateAccountDto,
  CreateAccountDto,
  ListCampaignsDto,
} from './zemanta.dto';
import { reply } from '../../app/utils/reply';

@Controller('zemanta')
export class ZemantaController {
  constructor(private readonly zemantaService: ZemantaService) {}

  /**
   * List all accounts
   * GET /api/v1/zemanta/accounts
   */
  @Get('accounts')
  async list_Accounts(
    @Query(new ValidationPipe({ transform: true })) query: ListAccountsDto,
    @Res() res,
  ) {
    const data = await this.zemantaService.listAccounts(
      query.includeArchived,
      query.includeDeliveryStatus,
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
    @Res() res,
  ) {
    const data = await this.zemantaService.getAccountDetails(
      accountId,
      includeDeliveryStatus,
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
   * Update account
   * PUT /api/v1/zemanta/accounts/:accountId
   */
  @Put('accounts/:accountId')
  async update_Account(
    @Param('accountId') accountId: string,
    @Body(new ValidationPipe()) updateDto: UpdateAccountDto,
    @Res() res,
  ) {
    const data = await this.zemantaService.updateAccount(accountId, updateDto);
    return reply({
      res,
      results: data,
    });
  }

  /**
   * Create new account
   * POST /api/v1/zemanta/accounts
   */
  @Post('accounts')
  async create_Account(
    @Body(new ValidationPipe()) createDto: CreateAccountDto,
    @Res() res,
  ) {
    const data = await this.zemantaService.createAccount(createDto);
    return reply({
      res,
      results: data,
    });
  }

  /**
   * Get account sources
   * GET /api/v1/zemanta/accounts/:accountId/sources
   */
  @Get('accounts/:accountId/sources')
  async get_AccountSources(@Param('accountId') accountId: string, @Res() res) {
    const data = await this.zemantaService.getAccountSources(accountId);
    return reply({
      res,
      results: {
        ...data,
        message: 'Account sources retrieved successfully',
      },
    });
  }

  /**
   * Get account credits
   * GET /api/v1/zemanta/accounts/:accountId/credits
   */
  @Get('accounts/:accountId/credits')
  async get_AccountCredits(@Param('accountId') accountId: string, @Res() res) {
    const data = await this.zemantaService.getAccountCredits(accountId);
    return reply({
      res,
      results: {
        ...data,
        message: 'Account credits retrieved successfully',
      },
    });
  }

  /**
   * Get account credit details
   * GET /api/v1/zemanta/accounts/:accountId/credits/:creditId
   */
  @Get('accounts/:accountId/credits/:creditId')
  async get_AccountCreditDetails(
    @Param('accountId') accountId: string,
    @Param('creditId') creditId: string,
    @Res() res,
  ) {
    const data = await this.zemantaService.getAccountCreditDetails(
      accountId,
      creditId,
    );
    return reply({
      res,
      results: {
        ...data,
        message: 'Credit details retrieved successfully',
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
    @Res() res,
  ) {
    const data = await this.zemantaService.listCampaigns(query);
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
    @Res() res?,
  ) {
    const result = await this.zemantaService.getCampaignDetails(
      campaignId,
      from,
      to,
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

    const data = await this.zemantaService.syncCampaignsToDatabase(from, to);
    return reply({
      res,
      results: data,
    });
  }
}
