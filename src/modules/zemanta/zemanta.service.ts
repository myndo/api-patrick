import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  ZemantaAdapter,
  ZemantaAccount,
} from '../integrations/zemanta-adapter';

@Injectable()
export class ZemantaService {
  private zemantaAdapter: ZemantaAdapter;

  constructor() {
    this.zemantaAdapter = new ZemantaAdapter({
      clientId: process.env.ZEMANTA_CLIENT_ID || '',
      clientSecret: process.env.ZEMANTA_CLIENT_SECRET || '',
    });
  }

  /**
   * List all accounts
   */
  async listAccounts(
    includeArchived: boolean = false,
    includeDeliveryStatus: boolean = false,
  ) {
    try {
      const accounts = await this.zemantaAdapter.listAccounts({
        includeArchived,
        includeDeliveryStatus,
      });
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
  ) {
    try {
      const account = await this.zemantaAdapter.getAccountDetails(
        accountId,
        includeDeliveryStatus,
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
   * Update account
   */
  async updateAccount(accountId: string, updates: Partial<ZemantaAccount>) {
    try {
      const account = await this.zemantaAdapter.updateAccount(
        accountId,
        updates,
      );
      return { account, message: 'Account updated successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to update account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create new account
   */
  async createAccount(accountData: Partial<ZemantaAccount>) {
    try {
      const account = await this.zemantaAdapter.createAccount(accountData);
      return { account, message: 'Account created successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to create account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get account sources
   */
  async getAccountSources(accountId: string) {
    try {
      const sources = await this.zemantaAdapter.getAccountSources(accountId);
      return { sources };
    } catch (error) {
      throw new HttpException(
        `Failed to get account sources: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get account credits
   */
  async getAccountCredits(accountId: string) {
    try {
      const credits = await this.zemantaAdapter.getAccountCredits(accountId);
      return { credits };
    } catch (error) {
      throw new HttpException(
        `Failed to get account credits: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get account credit details
   */
  async getAccountCreditDetails(accountId: string, creditId: string) {
    try {
      const credit = await this.zemantaAdapter.getAccountCreditDetails(
        accountId,
        creditId,
      );
      return { credit };
    } catch (error) {
      throw new HttpException(
        `Failed to get credit details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List campaigns
   */
  async listCampaigns(params: {
    includeArchived?: boolean;
    includeGoals?: boolean;
    includeBudgets?: boolean;
    includeDeliveryStatus?: boolean;
    accountId?: string;
    excludeInactive?: boolean;
    from?: string;
    to?: string;
  }) {
    try {
      // If from and to dates are provided, fetch campaigns with stats
      if (params.from && params.to) {
        const { from, to, ...campaignParams } = params;
        const campaigns = await this.zemantaAdapter.listCampaignsWithStats(
          campaignParams,
          from,
          to,
        );
        return { campaigns };
      }

      // Otherwise, fetch campaigns without stats
      const campaigns = await this.zemantaAdapter.listCampaigns(params);
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
  async getCampaignStats(campaignId: string, from: string, to: string) {
    try {
      const stats = await this.zemantaAdapter.getCampaignStats(
        campaignId,
        from,
        to,
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
  async getCampaignBudgets(campaignId: string) {
    try {
      const budgets = await this.zemantaAdapter.getCampaignBudgets(campaignId);
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
  async getCampaignDetails(campaignId: string, from?: string, to?: string) {
    try {
      const result = await this.zemantaAdapter.getCampaignDetails(
        campaignId,
        from,
        to,
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
   * Sync all campaigns with budgets and stats to database
   */
  async syncCampaignsToDatabase(from: string, to: string) {
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      const { DatabaseService } =
        await import('../../app/database/database.service');
      const prisma = new DatabaseService();

      // Get all accounts
      const accounts = await this.zemantaAdapter.listAccounts({
        includeArchived: false,
      });

      let totalCampaigns = 0;
      const errors = [];

      // Process each account
      for (const account of accounts) {
        try {
          // Get campaigns for this account with budgets and stats
          const { campaigns } = await this.listCampaigns({
            accountId: account.id,
            includeBudgets: true,
            includeGoals: false,
            includeArchived: false,
            excludeInactive: false,
            includeDeliveryStatus: true,
            from,
            to,
          });

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
