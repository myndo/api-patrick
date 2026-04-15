import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ZemantaAdapter } from '../integrations/zemanta-adapter';
import { DatabaseService } from '../../app/database/database.service';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import { CreateZemantaJobDto, GenerateAccessTokenDto } from './zemanta.dto';

@Injectable()
export class ZemantaService {
  private zemantaAdapter: ZemantaAdapter;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly integrationTokenService: IntegrationTokenService,
  ) {
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

  private async resolveOrCreateUserFromAccounts(accounts: any[]) {
    const primary = accounts[0] || {};
    const accountId = primary.id;

    const email = accountId
      ? `zemanta-account-${String(accountId).toLowerCase()}@zemanta.local`
      : undefined;

    if (!email) {
      throw new HttpException(
        'Unable to create user from Zemanta accounts: missing account id.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const displayName = primary.name || `Zemanta Account ${accountId || ''}`;

    return this.databaseService.user.upsert({
      where: { email },
      create: {
        email,
        name: displayName,
        provider: 'zemanta',
        confirmedAt: new Date(),
      },
      update: {
        name: displayName,
        provider: 'zemanta',
      },
    });
  }

  private async saveAccountsToProviderProfile(userId: string, accounts: any[]) {
    const savedProfiles = [];
    const agencyIds = Array.from(
      new Set(
        accounts
          .map((account) => account?.agencyId)
          .filter(
            (agencyId): agencyId is string =>
              typeof agencyId === 'string' && agencyId.trim().length > 0,
          ),
      ),
    );
    const rawData = JSON.stringify(agencyIds);

    for (const account of accounts) {
      const providerAccountId = account?.id ? String(account.id) : null;
      const data = {
        providerAccountId,
        displayName: account?.name || null,
        currency: account?.currency || null,
        rawData,
      };

      const existing = providerAccountId
        ? await this.databaseService.providerProfile.findFirst({
            where: {
              userId,
              provider: 'zemanta',
              providerAccountId,
              deletedAt: null,
            },
          })
        : null;

      if (existing) {
        const updated = await this.databaseService.providerProfile.update({
          where: { id: existing.id },
          data,
        });
        savedProfiles.push(updated);
        continue;
      }

      const created = await this.databaseService.providerProfile.create({
        data: {
          user: { connect: { id: userId } },
          provider: 'zemanta',
          ...data,
        },
      });
      savedProfiles.push(created);
    }

    return savedProfiles;
  }

  /**
   * Generate access token from provided credentials
   */
  async generateAccessToken(body: GenerateAccessTokenDto) {
    try {
      const adapter = new ZemantaAdapter({
        clientId: body.clientId,
        clientSecret: body.clientSecret,
      });

      const accessToken = await adapter.getAccessToken();

      const accounts = await adapter.listAccounts(
        {
          includeDeliveryStatus: true,
        },
        accessToken,
      );

      if (!accounts.length) {
        throw new HttpException(
          'No Zemanta accounts were returned for these credentials.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.resolveOrCreateUserFromAccounts(accounts);
      const expiresAt = new Date(Date.now() + 55 * 60 * 1000);

      const providerProfiles = await this.saveAccountsToProviderProfile(
        user.id,
        accounts,
      );

      for (const profile of providerProfiles) {
        await this.integrationTokenService.saveToken(
          user.id,
          'zemanta',
          {
            accessToken,
            expiresAt,
            metadata: {
              clientId: body.clientId,
              clientSecret: body.clientSecret,
              baseUrl:
                process.env.ZEMANTA_BASE_URL || 'https://oneapi.zemanta.com',
            },
          },
          profile.id,
        );
      }

      return {
        user_id: user.id,
        id: providerProfiles[0]?.id ?? null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }

  private async resolveZemantaToken(
    authorization?: string,
    userId?: string,
    profileId?: string,
  ): Promise<string | undefined> {
    const fromHeader = this.extractAccessToken(authorization);
    if (fromHeader) return fromHeader;

    if (!userId) return undefined;

    const stored = await this.integrationTokenService.getToken(
      userId,
      'zemanta',
      profileId,
    );
    if (!stored) return undefined;

    if (!stored.isExpired) return stored.accessToken;

    // Token expired — auto-refresh using stored credentials
    if (!stored.metadata?.clientId || !stored.metadata?.clientSecret) {
      return undefined;
    }

    const adapter = new ZemantaAdapter({
      clientId: stored.metadata.clientId,
      clientSecret: stored.metadata.clientSecret,
      baseUrl: stored.metadata.baseUrl,
    });
    const freshToken = await adapter.getAccessToken();
    const expiresAt = new Date(Date.now() + 55 * 60 * 1000);

    await this.integrationTokenService.saveToken(
      userId,
      'zemanta',
      {
        accessToken: freshToken,
        expiresAt,
        metadata: stored.metadata,
      },
      profileId,
    );

    return freshToken;
  }

  /**
   * List all accounts
   */
  async listAccounts(
    includeArchived: boolean = false,
    includeDeliveryStatus: boolean = false,
    authorization?: string,
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveZemantaToken(authorization, userId);
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
        `Failed to list accounts: ${error}`,
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
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveZemantaToken(authorization, userId);
      const account = await this.zemantaAdapter.getAccountDetails(
        accountId,
        includeDeliveryStatus,
        accessToken,
      );
      return { account };
    } catch (error) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to fetch Zemanta account details',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
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
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveZemantaToken(authorization, userId);
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
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to list campaigns',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
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
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveZemantaToken(authorization, userId);
      const stats = await this.zemantaAdapter.getCampaignStats(
        campaignId,
        from,
        to,
        accessToken,
      );
      return { stats };
    } catch (error) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to get campaign stats',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get campaign budgets
   */
  async getCampaignBudgets(
    campaignId: string,
    authorization?: string,
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveZemantaToken(authorization, userId);
      const budgets = await this.zemantaAdapter.getCampaignBudgets(
        campaignId,
        accessToken,
      );
      return { budgets };
    } catch (error) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to get campaign budgets',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
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
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveZemantaToken(authorization, userId);
      const result = await this.zemantaAdapter.getCampaignDetails(
        campaignId,
        from,
        to,
        accessToken,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        (error instanceof Error ? error.message : String(error)) ||
          'Failed to get campaign details',
        error instanceof Object && 'status' in error
          ? (error as any).status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAndQueueZemantaJob(body: CreateZemantaJobDto) {
    const { fromDate, toDate, profileId, accountId } = body;

    const profile = await this.databaseService.providerProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        userId: true,
        provider: true,
        providerAccountId: true,
      },
    });

    if (!profile || profile.provider !== 'zemanta') {
      throw new HttpException(
        `No zemanta profile found for profileId=${profileId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userId = profile.userId;
    const resolvedAccountId = accountId || profile.providerAccountId || null;

    const job = await this.databaseService.providerJob.create({
      data: {
        user: { connect: { id: userId } },
        profile: { connect: { id: profileId } },
        provider: 'zemanta',
        status: 0,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reportType: resolvedAccountId,
      },
    });

    return { job_Id: job.id };
  }

  async getJobStatus(jobId: string) {
    const job = await this.databaseService.providerJob.findUnique({
      where: { id: jobId },
    });

    if (!job || job.provider !== 'zemanta') {
      throw new HttpException(
        `No Zemanta job found for job_Id=${jobId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      job_Id: job.id,
      status: job.status,
    };
  }

  async findAllByJobId(jobId: string) {
    const job = await this.databaseService.providerJob.findUnique({
      where: { id: jobId },
    });

    if (!job || job.provider !== 'zemanta') {
      throw new HttpException(
        `No Zemanta job found for job_Id=${jobId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const reports = await this.databaseService.zemantaReport.findMany({
      where: {
        deletedAt: null,
        OR: [
          { providerJobId: job.id },
          {
            statsFrom: { gte: job.fromDate },
            statsTo: { lte: job.toDate },
            ...(job.reportType ? { accountId: job.reportType } : {}),
          },
        ],
      },
      orderBy: [{ createdAt: 'asc' }, { campaignId: 'asc' }],
    });

    return {
      job_Id: job.id,
      status: job.status,
      rowsCount: job.rowsCount,
      data: reports,
    };
  }

  async getZemantaProfilesByUserId(userId: string) {
    const profiles = await this.databaseService.providerProfile.findMany({
      where: {
        userId,
        provider: 'zemanta',
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (profiles.length === 0) {
      throw new HttpException(
        `No zemanta profiles found for userId=${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return profiles;
  }
}
