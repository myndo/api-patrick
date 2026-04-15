import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import { RTBHouseServiceAdapter } from '../integrations/rtbhouse-service-adapter';
import { FetchRTBHouseDataDto } from './rtb_house.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly client: DatabaseService,
    private readonly integrationTokenService: IntegrationTokenService,
  ) {}

  private pickString(obj: Record<string, any>, keys: string[]): string | null {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return null;
  }

  private flattenUserInfo(userInfo: Record<string, any>): Record<string, any> {
    const nested = [
      userInfo,
      userInfo.user,
      userInfo.data,
      userInfo.account,
      userInfo.result,
      userInfo.results,
    ];

    return nested.reduce(
      (acc, item) => {
        if (item && typeof item === 'object') {
          Object.assign(acc, item);
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  private mergeProfileSources(
    ...sources: Array<Record<string, any>>
  ): Record<string, any> {
    return sources.reduce(
      (acc, source) => {
        Object.assign(acc, this.flattenUserInfo(source));
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  private async resolveOrCreateUserFromUserInfo(
    username: string,
    flattened: Record<string, any>,
  ) {
    const rawEmail = this.pickString(flattened, [
      'email',
      'userEmail',
      'login',
    ]);
    const email = rawEmail
      ? rawEmail.toLowerCase()
      : `rtbhouse-${username.toLowerCase()}@rtbhouse.local`;

    const displayName = this.pickString(flattened, [
      'name',
      'fullName',
      'userName',
      'displayName',
    ]);

    return this.client.user.upsert({
      where: { email },
      create: {
        email,
        name: displayName || username,
        provider: 'rtbhouse',
        confirmedAt: new Date(),
      },
      update: {
        name: displayName || undefined,
        provider: 'rtbhouse',
      },
    });
  }

  private async saveUserInfoToProviderProfile(
    userId: string,
    flattened: Record<string, any>,
  ) {
    const providerAccountId =
      this.pickString(flattened, ['id', 'userId', 'accountId', 'hash']) || null;
    const displayName =
      this.pickString(flattened, ['name', 'fullName', 'displayName']) || null;
    const email = this.pickString(flattened, ['email', 'userEmail']) || null;
    const username =
      this.pickString(flattened, ['username', 'login', 'userName']) || null;
    const phone = this.pickString(flattened, ['phone', 'phoneNumber']) || null;
    const address =
      this.pickString(flattened, ['address', 'streetAddress']) || null;
    const city = this.pickString(flattened, ['city']) || null;
    const country =
      this.pickString(flattened, ['country', 'countryCode']) || null;
    const currency = this.pickString(flattened, ['currency']) || null;
    const websiteUrl = this.pickString(flattened, [
      'websiteUrl',
      'website',
      'url',
      'siteUrl',
      'homepage',
    ]);

    const data = {
      providerAccountId,
      displayName,
      email,
      username,
      phone,
      address,
      city,
      country,
      currency,
      websiteUrl: websiteUrl || null,
      // rawData: JSON.stringify(flattened),
    };

    const existing = providerAccountId
      ? await this.client.providerProfile.findFirst({
          where: {
            userId,
            provider: 'rtbhouse',
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
        provider: 'rtbhouse',
        ...data,
      },
    });
  }

  async loginAndSetup(username: string, password: string, accessToken: string) {
    const baseUrl =
      process.env.RTBHOUSE_BASE_URL || 'https://api.panel.rtbhouse.com/v5';

    const adapter = new RTBHouseServiceAdapter({
      baseUrl,
      advertiserId: 'bootstrap',
      username,
      password,
    });

    let clientInfo: Record<string, any>;
    let advertiserInfo: Record<string, any>;
    try {
      const advertiserHashes = await adapter.fetchAdvertiserHashes();
      const advertiserId = advertiserHashes[0];

      if (!advertiserId) {
        throw new HttpException(
          'No advertiser hash returned by RTB House for this account',
          HttpStatus.UNAUTHORIZED,
        );
      }

      clientInfo = await adapter.fetchClientInfo(advertiserId);
      advertiserInfo = await adapter.fetchAdvertiserInfo(advertiserId);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch RTB House client info';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }

    const mergedInfo = this.mergeProfileSources(clientInfo, advertiserInfo);
    const flattened = this.mergeProfileSources(mergedInfo, {
      advertiserId: this.pickString(mergedInfo, ['hash']) || undefined,
    });
    const user = await this.resolveOrCreateUserFromUserInfo(
      username,
      flattened,
    );

    const providerProfile = await this.saveUserInfoToProviderProfile(
      user.id,
      flattened,
    );

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.integrationTokenService.saveToken(
      user.id,
      'rtbhouse',
      {
        accessToken,
        expiresAt,
        scope: 'platform-auth',
        metadata: {
          username,
          password,
        },
      },
      providerProfile.id,
    );

    return { user, userInfo: flattened, providerProfile };
  }

  async getJobStatus(jobId: string) {
    const job = await this.client.providerJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new HttpException(
        `No RTBHouse job found for job_Id=${jobId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      job_Id: job.id,
      status: job.status,
    };
  }

  async findOneBy(selections: { jobId?: string }) {
    const { jobId } = selections;

    if (!jobId) {
      return null;
    }

    return this.client.rTBHouseReport.findFirst({
      where: { id: jobId, deletedAt: null },
    });
  }

  async findAllByJobId(jobId: string) {
    const job = await this.client.providerJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new HttpException(
        `No RTBHouse job found for job_Id=${jobId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const reports = await this.client.rTBHouseReport.findMany({
      where: {
        deletedAt: null,
        providerJobId: jobId,
      },
      orderBy: [{ day: 'asc' }, { campaign: 'asc' }],
    });

    return {
      job_Id: job.id,
      status: job.status,
      rowsCount: job.rowsCount,
      data: reports,
    };
  }

  async getRtbHouseProfileByUserId(userId: string) {
    const profile = await this.client.providerProfile.findFirst({
      where: {
        userId,
        provider: 'rtbhouse',
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new HttpException(
        `No rtbhouse profile found for userId=${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return profile;
  }

  async createAndQueueRTBHouseJob(body: FetchRTBHouseDataDto) {
    const { dayFrom, dayTo, profileId } = body;

    const profile = await this.client.providerProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        userId: true,
        provider: true,
      },
    });

    if (!profile || profile.provider !== 'rtbhouse') {
      throw new HttpException(
        `No rtbhouse profile found for profileId=${profileId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const userId = profile.userId;

    // Get stored RTB House credentials
    const stored = await this.integrationTokenService.getToken(
      userId,
      'rtbhouse',
      profileId,
    );
    if (!stored || stored.isExpired) {
      throw new HttpException(
        'No valid RTB House credentials found for user. Please call POST /rtbhouse/users/register first.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Validate credentials metadata
    if (!stored.metadata?.username || !stored.metadata?.password) {
      throw new HttpException(
        'RTB House credentials missing or incomplete. Please re-register.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Resolve advertiser hash from RTB House API
    let advertiserId: string;
    try {
      const baseUrl =
        process.env.RTBHOUSE_BASE_URL || 'https://api.panel.rtbhouse.com/v5';
      const adapter = new RTBHouseServiceAdapter({
        baseUrl,
        advertiserId: 'bootstrap',
        username: stored.metadata.username,
        password: stored.metadata.password,
      });

      const hashes = await adapter.fetchAdvertiserHashes();
      advertiserId = hashes[0];

      if (!advertiserId) {
        throw new HttpException(
          'No advertiser hash found in RTB House account',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error: unknown) {
      // Preserve HttpException from RTB House API calls
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch advertiser hashes';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }

    const job = await this.client.providerJob.create({
      data: {
        user: { connect: { id: userId } },
        profile: { connect: { id: profileId } },
        provider: 'rtbhouse',
        status: 0,
        fromDate: new Date(dayFrom),
        toDate: new Date(dayTo),
        reportType: advertiserId,
      },
    });

    return { job_Id: job.id };
  }
}
