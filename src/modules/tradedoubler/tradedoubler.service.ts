import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import { CreateTradeDoublerJobDto } from './tradedoubler.dto';

@Injectable()
export class TradeDoublerJobsService {
  private extractAccessToken(authorization?: string): string | undefined {
    if (!authorization) return undefined;
    return authorization.replace(/^Bearer\s+/i, '').trim();
  }

  constructor(
    private readonly client: DatabaseService,
    private readonly integrationTokenService: IntegrationTokenService,
  ) {}

  async findAllByJobId(jobId: string) {
    const job = await this.client.providerJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new HttpException(
        `No TradeDoubler job found for job_Id=${jobId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const reports = await this.client.tradeDoublerReport.findMany({
      where: { deletedAt: null, jobId },
      orderBy: [{ date: 'asc' }, { programId: 'asc' }],
    });

    return {
      job_Id: job.id,
      status: job.status,
      rowsCount: job.rowsCount,
      data: reports,
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.client.providerJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new HttpException(
        `No TradeDoubler job found for job_Id=${jobId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      job_Id: job.id,
      status: job.status,
    };
  }

  private async fetchAndParseAdvertiserAccount(accessToken: string) {
    const { default: axios } = await import('axios');
    const response = await axios.get(
      'https://connect.tradedoubler.com/advertiser/account',
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      },
    );
    return response.data || {};
  }

  async saveAccountToProviderProfile(
    userId: string,
    account: Record<string, any>,
  ) {
    const contact = account.primaryContactPerson || {};
    const address = account.primaryAddress || {};

    const mappedAddress = [address.street, address.street2, address.postCode]
      .filter(Boolean)
      .join(', ');

    const providerAccountId = account.organizationId
      ? String(account.organizationId)
      : null;

    const data = {
      providerAccountId,
      displayName: account.name || null,
      email: contact.email || null,
      username: contact.username || null,
      phone: contact.telephone || null,
      address: mappedAddress || null,
      city: address.city || null,
      country: address.countryCode || null,
      currency: account.currency || null,
      websiteUrl: account.websiteUrl || null,
      rawData: JSON.stringify(account),
    };

    const existing = providerAccountId
      ? await this.client.providerProfile.findFirst({
          where: {
            userId,
            provider: 'tradedoubler',
            providerAccountId,
            deletedAt: null,
          },
        })
      : null;

    if (existing) {
      return this.client.providerProfile.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.client.providerProfile.create({
      data: {
        user: { connect: { id: userId } },
        provider: 'tradedoubler',
        ...data,
      },
    });
  }

  private async resolveOrCreateUserFromAccount(account: Record<string, any>) {
    const contact = account.primaryContactPerson || {};
    const organizationId = account.organizationId;

    const emailFromProvider =
      typeof contact.email === 'string' && contact.email.trim().length > 0
        ? contact.email.trim().toLowerCase()
        : undefined;

    const fallbackEmail = organizationId
      ? `td-org-${organizationId}@tradedoubler.local`
      : undefined;

    const email = emailFromProvider || fallbackEmail;
    if (!email) {
      throw new HttpException(
        'Unable to create user from TradeDoubler account: missing email and organizationId.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.client.user.upsert({
      where: { email },
      create: {
        email,
        name: account.name || `TradeDoubler Advertiser ${organizationId || ''}`,
        provider: 'tradedoubler',
        confirmedAt: new Date(),
      },
      update: {
        provider: 'tradedoubler',
      },
    });
  }

  /**
   * Called after OAuth login: saves token + fetches advertiser account
   * + upserts provider profile - all in one shot.
   */
  async loginAndSetup(
    accessToken: string,
    refreshToken: string | undefined,
    expiresAt: Date | undefined,
    scope: string | undefined,
    clientId: string,
    secret: string,
    username: string,
  ) {
    // 1. Fetch advertiser account from TradeDoubler
    const account = await this.fetchAndParseAdvertiserAccount(accessToken);

    // 2. Resolve existing user or create a new one
    const user = await this.resolveOrCreateUserFromAccount(account);
    const userId = user.id;

    // 3. Upsert provider profile with account data
    const providerProfile = await this.saveAccountToProviderProfile(
      userId,
      account,
    );

    // 4. Save token scoped to profile
    await this.integrationTokenService.saveToken(
      userId,
      'tradedoubler',
      {
        accessToken,
        refreshToken,
        expiresAt,
        scope,
        metadata: {
          clientId,
          secret,
          username,
          organizationId: String(account.organizationId ?? ''),
          tdOrganizationId: String(account.tdOrganizationId ?? ''),
        },
      },
      providerProfile.id,
    );

    return { user, account, providerProfile };
  }

  async getTradedoublerProfileByUserId(userId: string) {
    const profile = await this.client.providerProfile.findFirst({
      where: {
        userId,
        provider: 'tradedoubler',
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new HttpException(
        `No tradedoubler profile found for userId=${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return profile;
  }

  /** Find one TradeDoubler Report in database. */
  private async refreshToken(
    userId: string,
    refreshToken: string,
    metadata?: Record<string, string>,
    profileId?: string,
  ): Promise<string> {
    const clientId = metadata?.clientId || process.env.TRADEDOUBLER_CLIENT_ID;
    const secret = metadata?.secret || process.env.TRADEDOUBLER_SECRET;

    if (!clientId || !secret) {
      throw new HttpException(
        'Missing TradeDoubler client credentials for refresh. Please re-authenticate.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const encoded = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const { default: axios } = await import('axios');
    const response = await axios.post(
      'https://connect.tradedoubler.com/uaa/oauth/token',
      params.toString(),
      {
        headers: {
          Authorization: `Basic ${encoded}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      },
    );

    const expiresIn = Number(response.data.expires_in);
    const expiresAt = Number.isFinite(expiresIn)
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;

    await this.integrationTokenService.saveToken(
      userId,
      'tradedoubler',
      {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token ?? refreshToken,
        expiresAt,
        scope: response.data.scope ?? undefined,
        metadata: {
          ...(metadata || {}),
          clientId,
          secret,
        },
      },
      profileId,
    );

    return response.data.access_token;
  }

  private async resolveAccessToken(
    userId?: string,
    authorization?: string,
    profileId?: string,
  ): Promise<string | undefined> {
    const fromHeader = this.extractAccessToken(authorization);
    if (fromHeader) return fromHeader;

    if (!userId) return undefined;

    const stored = await this.integrationTokenService.getToken(
      userId,
      'tradedoubler',
      profileId,
    );

    if (!stored) {
      throw new HttpException(
        `No stored TradeDoubler token found for userId=${userId}. Login first using /trade_doubler/auth/login.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!stored.isExpired) {
      return stored.accessToken;
    }

    if (!stored.refreshToken) {
      throw new HttpException(
        'TradeDoubler token expired and no refresh token is stored. Please login again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.refreshToken(
      userId,
      stored.refreshToken,
      stored.metadata,
      profileId,
    );
  }

  async createAndRunTradeDoublerJob(
    body: CreateTradeDoublerJobDto,
    authorization?: string,
  ) {
    const {
      fromDate,
      toDate,
      reportCurrencyCode,
      reportType,
      intervalType,
      profileId,
    } = body;

    const profile = await this.client.providerProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        userId: true,
        provider: true,
      },
    });

    if (!profile || profile.provider !== 'tradedoubler') {
      throw new HttpException(
        `No tradedoubler profile found for profileId=${profileId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userId = profile.userId;

    const accessToken = await this.resolveAccessToken(
      userId,
      authorization,
      profileId,
    );

    if (!accessToken) {
      throw new HttpException(
        'Missing Authorization header. Use Bearer <accessToken> or provide a userId with stored token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Ensure the worker can always resolve a fresh access token from storage.
    const storedToken = await this.integrationTokenService.getToken(
      userId,
      'tradedoubler',
      profileId,
    );

    await this.integrationTokenService.saveToken(
      userId,
      'tradedoubler',
      {
        accessToken,
        refreshToken: storedToken?.refreshToken,
        expiresAt: storedToken?.expiresAt ?? undefined,
        scope: storedToken?.scope ?? undefined,
        metadata: storedToken?.metadata,
      },
      profileId,
    );

    const job = await this.client.providerJob.create({
      data: {
        user: { connect: { id: userId } },
        profile: { connect: { id: profileId } },
        provider: 'tradedoubler',
        status: 0,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reportCurrencyCode,
        reportType,
        intervalType,
      },
    });

    return { job_Id: job.id };
  }
}
