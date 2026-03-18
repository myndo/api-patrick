import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ZemantaAdapter } from '../integrations/zemanta-adapter';
import { DatabaseService } from '../../app/database/database.service';
import { GenerateAccessTokenDto } from './zemanta.dto';

@Injectable()
export class ZemantaService {
  private zemantaAdapter: ZemantaAdapter;

  constructor(private readonly databaseService: DatabaseService) {
    this.zemantaAdapter = new ZemantaAdapter({
      clientId: process.env.ZEMANTA_CLIENT_ID || '',
      clientSecret: process.env.ZEMANTA_CLIENT_SECRET || '',
    });
  }

  private extractAccessToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }

    return authorization.replace(/^Bearer\s+/i, '').trim();
  }

  /**
   * Generate access token from provided credentials
   */
  async generateAccessToken(body: GenerateAccessTokenDto) {
    try {
      const adapter = new ZemantaAdapter({
        clientId: body.clientId,
        clientSecret: body.clientSecret,
        baseUrl: body.baseUrl,
      });

      const accessToken = await adapter.getAccessToken();
      return {
        accessToken,
        authorization: `Bearer ${accessToken}`,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to generate access token: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * List all accounts
   */
  async listAccounts(
    includeArchived: boolean = false,
    includeDeliveryStatus: boolean = false,
    authorization?: string,
  ) {
    try {
      const accessToken = this.extractAccessToken(authorization);
      const accounts = await this.zemantaAdapter.listAccounts(
        {
          includeArchived,
          includeDeliveryStatus,
        },
        accessToken,
      );
      return { accounts };
    } catch (error) {
      throw new HttpException(
        `Failed to list accounts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(
    accountId: string,
    includeDeliveryStatus: boolean = false,
    authorization?: string,
  ) {
    try {
      const accessToken = this.extractAccessToken(authorization);
      const account = await this.zemantaAdapter.getAccountDetails(
        accountId,
        includeDeliveryStatus,
        accessToken,
      );
      return { account };
    } catch (error) {
      throw new HttpException(
        `Failed to get account details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List campaigns
   */
  async listCampaigns(
    params: {
      includeArchived?: boolean;
      includeGoals?: boolean;
      includeBudgets?: boolean;
      includeDeliveryStatus?: boolean;
      accountId?: string;
      excludeInactive?: boolean;
      from?: string;
      to?: string;
    },
    authorization?: string,
  ) {
    try {
      const accessToken = this.extractAccessToken(authorization);
      // If from and to dates are provided, fetch campaigns with stats
      if (params.from && params.to) {
        const { from, to, ...campaignParams } = params;
        const campaigns = await this.zemantaAdapter.listCampaignsWithStats(
          campaignParams,
          from,
          to,
          accessToken,
        );
        return { campaigns };
      }

      // Otherwise, fetch campaigns without stats
      const campaigns = await this.zemantaAdapter.listCampaigns(
        params,
        accessToken,
      );
      return { campaigns };
    } catch (error) {
      throw new HttpException(
        `Failed to list campaigns: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(
    campaignId: string,
    from: string,
    to: string,
    authorization?: string,
  ) {
    try {
      const accessToken = this.extractAccessToken(authorization);
      const stats = await this.zemantaAdapter.getCampaignStats(
        campaignId,
        from,
        to,
        accessToken,
      );
      return { stats };
    } catch (error) {
      throw new HttpException(
        `Failed to get campaign stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get campaign budgets
   */
  async getCampaignBudgets(campaignId: string, authorization?: string) {
    try {
      const accessToken = this.extractAccessToken(authorization);
      const budgets = await this.zemantaAdapter.getCampaignBudgets(
        campaignId,
        accessToken,
      );
      return { budgets };
    } catch (error) {
      throw new HttpException(
        `Failed to get campaign budgets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get campaign details (budgets and optionally stats)
   */
  async getCampaignDetails(
    campaignId: string,
    from?: string,
    to?: string,
    authorization?: string,
  ) {
    try {
      const accessToken = this.extractAccessToken(authorization);
      const result = await this.zemantaAdapter.getCampaignDetails(
        campaignId,
        from,
        to,
        accessToken,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to get campaign details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all campaigns from database with optional date filtering
   */
  async getAllCampaignsFromDatabase(statsFrom?: string, statsTo?: string) {
    try {
      const where: any = {};

      // Add date filters if provided
      if (statsFrom || statsTo) {
        where.AND = [];

        if (statsFrom) {
          where.AND.push({
            statsFrom: {
              gte: new Date(statsFrom),
            },
          });
        }

        if (statsTo) {
          where.AND.push({
            statsTo: {
              lte: new Date(statsTo),
            },
          });
        }
      }

      const campaigns = await this.databaseService.zemantaCampaign.findMany({
        where,
        include: {
          budgets: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return { campaigns };
    } catch (error) {
      throw new HttpException(
        `Failed to get campaigns from database: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sync all campaigns with budgets and stats to database
   */
  async syncCampaignsToDatabase(
    from: string,
    to: string,
    authorization?: string,
  ) {
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      const { DatabaseService } =
        await import('../../app/database/database.service');
      const prisma = new DatabaseService();

      const accessToken = this.extractAccessToken(authorization);

      // Get all accounts
      const accounts = await this.zemantaAdapter.listAccounts(
        {
          includeArchived: false,
        },
        accessToken,
      );

      let totalCampaigns = 0;
      const errors = [];

      // Process each account
      for (const account of accounts) {
        try {
          // Get campaigns for this account with budgets and stats
          const { campaigns } = await this.listCampaigns(
            {
              accountId: account.id,
              includeBudgets: true,
              includeGoals: false,
              includeArchived: false,
              excludeInactive: false,
              includeDeliveryStatus: true,
              from,
              to,
            },
            accessToken ? `Bearer ${accessToken}` : undefined,
          );

          // Store each campaign
          for (const campaign of campaigns) {
            try {
              // Type assertion for campaigns with stats
              const campaignWithStats = campaign as any;

              // Upsert campaign
              await prisma.zemantaCampaign.upsert({
                where: { id: campaign.id },
                update: {
                  accountId: campaign.accountId,
                  accountName: campaign.accountName,
                  currency: campaign.currency,
                  agencyName: campaign.agencyName,
                  campaignManager: campaign.campaignManager,
                  name: campaign.name,
                  archived: campaign.archived || false,
                  iabCategory: campaign.iabCategory,
                  frequencyCapping: campaign.frequencyCapping,
                  deliveryStatus: campaign.deliveryStatus,
                  totalCost: campaignWithStats.stats?.totalCost,
                  impressions: campaignWithStats.stats?.impressions,
                  clicks: campaignWithStats.stats?.clicks,
                  cpc: campaignWithStats.stats?.cpc,
                  statsFrom: from ? new Date(from) : null,
                  statsTo: to ? new Date(to) : null,
                  updatedAt: new Date(),
                },
                create: {
                  id: campaign.id,
                  accountId: campaign.accountId,
                  accountName: campaign.accountName,
                  currency: campaign.currency,
                  agencyName: campaign.agencyName,
                  campaignManager: campaign.campaignManager,
                  name: campaign.name,
                  archived: campaign.archived || false,
                  iabCategory: campaign.iabCategory,
                  frequencyCapping: campaign.frequencyCapping,
                  deliveryStatus: campaign.deliveryStatus,
                  totalCost: campaignWithStats.stats?.totalCost,
                  impressions: campaignWithStats.stats?.impressions,
                  clicks: campaignWithStats.stats?.clicks,
                  cpc: campaignWithStats.stats?.cpc,
                  statsFrom: from ? new Date(from) : null,
                  statsTo: to ? new Date(to) : null,
                },
              });

              // Store budgets if available
              if (campaign.budgets && campaign.budgets.length > 0) {
                for (const budget of campaign.budgets) {
                  await prisma.zemantaCampaignBudget.upsert({
                    where: { id: budget.id },
                    update: {
                      campaignId: campaign.id,
                      creditId: budget.creditId,
                      amount: budget.amount,
                      margin: budget.margin,
                      comment: budget.comment,
                      startDate: new Date(budget.startDate),
                      endDate: new Date(budget.endDate),
                      state: budget.state,
                      spend: budget.spend,
                      available: budget.available,
                      updatedAt: new Date(),
                    },
                    create: {
                      id: budget.id,
                      campaignId: campaign.id,
                      creditId: budget.creditId,
                      amount: budget.amount,
                      margin: budget.margin,
                      comment: budget.comment,
                      startDate: new Date(budget.startDate),
                      endDate: new Date(budget.endDate),
                      state: budget.state,
                      spend: budget.spend,
                      available: budget.available,
                    },
                  });
                }
              }

              totalCampaigns++;
            } catch (campaignError) {
              errors.push({
                campaignId: campaign.id,
                campaignName: campaign.name,
                error: campaignError.message,
              });
            }
          }
        } catch (accountError) {
          errors.push({
            accountId: account.id,
            accountName: account.name,
            error: accountError.message,
          });
        }
      }

      return {
        success: true,
        totalAccounts: accounts.length,
        totalCampaigns,
        errors,
        message: `Synced ${totalCampaigns} campaigns from ${accounts.length} accounts`,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to sync campaigns: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
