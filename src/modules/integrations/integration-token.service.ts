import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { decrypt, encrypt } from './token-encryption';

export type SaveTokenData = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  /** Provider-specific extras: e.g. { clientId, clientSecret } for Zemanta */
  metadata?: Record<string, string>;
};

export type LoadedToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date | null;
  scope?: string | null;
  metadata?: Record<string, string>;
  profileId?: string | null;
  isExpired: boolean;
};

@Injectable()
export class IntegrationTokenService {
  constructor(private readonly databaseService: DatabaseService) {}

  async saveToken(
    userId: string,
    provider: string,
    data: SaveTokenData,
    profileId?: string,
  ): Promise<void> {
    const encryptedAccess = encrypt(data.accessToken);
    const encryptedRefresh = data.refreshToken
      ? encrypt(data.refreshToken)
      : null;
    const encryptedMetadata = data.metadata
      ? encrypt(JSON.stringify(data.metadata))
      : null;

    if (profileId) {
      await this.databaseService.integrationToken.upsert({
        where: { profileId_provider: { profileId, provider } },
        create: {
          userId,
          profileId,
          provider,
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          expiresAt: data.expiresAt ?? null,
          scope: data.scope ?? null,
          metadata: encryptedMetadata,
        },
        update: {
          userId,
          accessToken: encryptedAccess,
          ...(encryptedRefresh !== null && { refreshToken: encryptedRefresh }),
          expiresAt: data.expiresAt ?? null,
          scope: data.scope ?? null,
          ...(encryptedMetadata !== null && { metadata: encryptedMetadata }),
        },
      });
      return;
    }

    const existing = await this.databaseService.integrationToken.findFirst({
      where: { userId, provider },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      await this.databaseService.integrationToken.update({
        where: { id: existing.id },
        data: {
          accessToken: encryptedAccess,
          ...(encryptedRefresh !== null && { refreshToken: encryptedRefresh }),
          expiresAt: data.expiresAt ?? null,
          scope: data.scope ?? null,
          ...(encryptedMetadata !== null && { metadata: encryptedMetadata }),
        },
      });
      return;
    }

    await this.databaseService.integrationToken.create({
      data: {
        userId,
        provider,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt: data.expiresAt ?? null,
        scope: data.scope ?? null,
        metadata: encryptedMetadata,
      },
    });
  }

  async getToken(
    userId: string,
    provider: string,
    profileId?: string,
  ): Promise<LoadedToken | null> {
    const record = profileId
      ? await this.databaseService.integrationToken.findUnique({
          where: { profileId_provider: { profileId, provider } },
        })
      : await this.databaseService.integrationToken.findFirst({
          where: { userId, provider },
          orderBy: { updatedAt: 'desc' },
        });

    if (!record) return null;

    const accessToken = decrypt(record.accessToken);
    const refreshToken = record.refreshToken
      ? decrypt(record.refreshToken)
      : undefined;
    const metadata = record.metadata
      ? (JSON.parse(decrypt(record.metadata)) as Record<string, string>)
      : undefined;

    const isExpired = record.expiresAt ? new Date() >= record.expiresAt : false;

    return {
      accessToken,
      refreshToken,
      expiresAt: record.expiresAt,
      scope: record.scope,
      metadata,
      profileId: record.profileId,
      isExpired,
    };
  }

  async deleteToken(
    userId: string,
    provider: string,
    profileId?: string,
  ): Promise<void> {
    await this.databaseService.integrationToken.deleteMany({
      where: profileId ? { profileId, provider } : { userId, provider },
    });
  }
}
