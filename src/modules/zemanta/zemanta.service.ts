import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ZemantaAdapter } from '../integrations/zemanta-adapter';
import { DatabaseService } from '../../app/database/database.service';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import { CreateZemantaJobDto } from './zemanta.dto';

@Injectable()
export class ZemantaService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly integrationTokenService: IntegrationTokenService,
  ) {}

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
  async generateAccessToken() {
    try {
      const clientId = process.env.ZEMANTA_CLIENT_ID || '';
      const clientSecret = process.env.ZEMANTA_CLIENT_SECRET || '';

      if (!clientId || !clientSecret) {
        throw new HttpException(
          'Missing Zemanta credentials in environment. Please set ZEMANTA_CLIENT_ID and ZEMANTA_CLIENT_SECRET.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const adapter = new ZemantaAdapter({
        clientId,
        clientSecret,
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
              clientId,
              clientSecret,
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
