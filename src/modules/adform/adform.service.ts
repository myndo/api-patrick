import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import {
  AdformServiceAdapter,
  AdformStatsRequest,
} from '../integrations/adform-adapter';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import {
  CreateAdformJobDto,
  FetchAdformStatsDto,
  LoginAdformDto,
} from './adform.dto';

const DEFAULT_DIMENSIONS = ['date', 'campaign', 'campaignId'];
const DEFAULT_METRICS = [
  'impressions',
  'clicks',
  'spend',
  'ctr',
  'cpm',
  'conversions',
];

@Injectable()
export class AdformService {
  private adapter: AdformServiceAdapter;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly integrationTokenService: IntegrationTokenService,
  ) {
    this.adapter = new AdformServiceAdapter({
      clientId: process.env.ADFORM_CLIENT_ID || '',
      clientSecret: process.env.ADFORM_CLIENT_SECRET || '',
      scope: process.env.ADFORM_SCOPES,
    });
  }

  private async resolveOrCreateUser(clientId: string, campaigns: any[]) {
    const primaryCampaign = campaigns[0] || {};
    const normalizedClientId = clientId.trim().toLowerCase();
    const email = `adform-client-${normalizedClientId}@adform.local`;
    const displayName =
      primaryCampaign?.name || `Adform Client ${clientId.trim()}`;

    return this.databaseService.user.upsert({
      where: { email },
      create: {
        email,
        name: displayName,
        provider: 'adform',
        confirmedAt: new Date(),
      },
      update: {
        name: displayName,
        provider: 'adform',
      },
    });
  }

  private async saveProviderProfile(
    userId: string,
    clientId: string,
    campaigns: any[],
  ) {
    const primaryCampaign = campaigns[0] || {};
    const providerAccountId = clientId.trim();
    const data = {
      providerAccountId,
      displayName:
        primaryCampaign?.name || `Adform Client ${providerAccountId}`,
      currency: primaryCampaign?.currency || null,
      rawData: JSON.stringify(campaigns),
    };

    const existing = await this.databaseService.providerProfile.findFirst({
      where: {
        userId,
        provider: 'adform',
        providerAccountId,
        deletedAt: null,
      },
    });

    if (existing) {
      return this.databaseService.providerProfile.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.databaseService.providerProfile.create({
      data: {
        user: { connect: { id: userId } },
        provider: 'adform',
        ...data,
      },
    });
  }

  async loginAndSetup(body: LoginAdformDto) {
    const clientId =
      body.clientId?.trim() || process.env.ADFORM_CLIENT_ID || '';
    const clientSecret =
      body.clientSecret?.trim() || process.env.ADFORM_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      throw new HttpException(
        'Missing Adform credentials. Provide clientId/clientSecret in request body or set ADFORM_CLIENT_ID/ADFORM_CLIENT_SECRET in .env.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const adapter = new AdformServiceAdapter({
      clientId,
      clientSecret,
      scope: process.env.ADFORM_SCOPES,
    });

    let token;
    let campaigns: any[] = [];
    try {
      token = await adapter.requestAccessToken();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: Record<string, any> };
        message?: string;
      };

      const providerMessage =
        axiosError.response?.data?.error_description ||
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to authenticate with Adform';

      throw new HttpException(
        String(providerMessage),
        axiosError.response?.status || HttpStatus.BAD_REQUEST,
      );
    }

    try {
      campaigns = await adapter.fetchCampaigns();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: Record<string, any> };
        message?: string;
      };

      const providerMessage = String(
        axiosError.response?.data?.error_description ||
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          '',
      ).toLowerCase();

      const isScopeError =
        axiosError.response?.status === HttpStatus.FORBIDDEN &&
        providerMessage.includes('scope');

      // Stats-only scopes can authenticate successfully but do not grant
      // access to campaign endpoints. In that case we still complete setup.
      if (!isScopeError) {
        throw new HttpException(
          String(
            axiosError.response?.data?.error_description ||
              axiosError.response?.data?.error ||
              axiosError.response?.data?.message ||
              axiosError.message ||
              'Failed to fetch Adform campaigns',
          ),
          axiosError.response?.status || HttpStatus.BAD_REQUEST,
        );
      }
    }

    const user = await this.resolveOrCreateUser(clientId, campaigns);
    const providerProfile = await this.saveProviderProfile(
      user.id,
      clientId,
      campaigns,
    );

    const expiresAt = Number.isFinite(token.expires_in)
      ? new Date(Date.now() + token.expires_in * 1000)
      : undefined;

    await this.integrationTokenService.saveToken(
      user.id,
      'adform',
      {
        accessToken: token.access_token,
        expiresAt,
        scope: token.scope,
        metadata: {
          clientId,
          clientSecret,
        },
      },
      providerProfile.id,
    );

    return {
      accessToken: token.access_token,
      expiresAt,
      scope: token.scope,
      user,
      providerProfile,
    };
  }

  async createAdformJob(body: CreateAdformJobDto) {
    const { fromDate, toDate, profileId, reportCurrencyCode } = body;

    const profile = await this.databaseService.providerProfile.findUnique({
      where: { id: profileId },
      select: { id: true, userId: true, provider: true },
    });

    if (!profile || profile.provider !== 'adform') {
      throw new HttpException(
        `No adform profile found for profileId=${profileId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const job = await this.databaseService.providerJob.create({
      data: {
        user: { connect: { id: profile.userId } },
        profile: { connect: { id: profileId } },
        provider: 'adform',
        status: 0,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        ...(reportCurrencyCode ? { reportCurrencyCode } : {}),
      },
    });

    return { job_Id: job.id };
  }

  async getAdformProfileByUserId(userId: string) {
    const profile = await this.databaseService.providerProfile.findFirst({
      where: {
        userId,
        provider: 'adform',
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new HttpException(
        `No adform profile found for userId=${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return profile;
  }

  async getCampaigns() {
    try {
      const campaigns = await this.adapter.fetchCampaigns();
      return { count: campaigns.length, campaigns };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch Adform campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStats(dto: FetchAdformStatsDto) {
    try {
      const request: AdformStatsRequest = {
        dateFrom: dto.dateFrom,
        dateTo: dto.dateTo,
        dimensions: dto.dimensions ?? DEFAULT_DIMENSIONS,
        metrics: dto.metrics ?? DEFAULT_METRICS,
        ...(dto.campaignIds?.length || dto.advertiserIds?.length
          ? {
              filter: {
                ...(dto.campaignIds?.length
                  ? { campaigns: dto.campaignIds }
                  : {}),
                ...(dto.advertiserIds?.length
                  ? { advertisers: dto.advertiserIds }
                  : {}),
              },
            }
          : {}),
      };

      const stats = await this.adapter.fetchStats(request);
      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch Adform stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
