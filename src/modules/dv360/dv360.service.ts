import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Dv360Adapter } from '../integrations/dv360-adapter';
import { IntegrationTokenService } from '../integrations/integration-token.service';
import { ExchangeDv360CodeDto } from './dv360.dto';

@Injectable()
export class Dv360Service {
  private dv360Adapter: Dv360Adapter;

  constructor(
    private readonly integrationTokenService: IntegrationTokenService,
  ) {
    this.dv360Adapter = new Dv360Adapter({
      clientId:
        process.env.DV360_CLIENT_ID ||
        '1008395844479-ah78ti7vhav9d37b7om5ubifsfs8m3i6.apps.googleusercontent.com',
      clientSecret: process.env.DV360_CLIENT_SECRET || '',
      redirectUri:
        process.env.DV360_REDIRECT_URI ||
        'http://localhost:8000/api/v1/dv360/redirect',
    });
  }

  private extractAccessToken(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    if (authorization.startsWith('Bearer ')) {
      return authorization.slice(7).trim();
    }

    return authorization.trim() || null;
  }

  generateAuthUrl(redirectUri?: string) {
    try {
      if (redirectUri) {
        this.dv360Adapter = new Dv360Adapter({
          clientId:
            process.env.DV360_CLIENT_ID ||
            '1008395844479-ah78ti7vhav9d37b7om5ubifsfs8m3i6.apps.googleusercontent.com',
          clientSecret: process.env.DV360_CLIENT_SECRET || '',
          redirectUri,
        });
      }

      const authUrl = this.dv360Adapter.generateAuthUrl();
      return { authUrl };
    } catch (error) {
      throw new HttpException(
        `Failed to generate DV360 auth URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exchangeCode(body: ExchangeDv360CodeDto) {
    try {
      const adapter = new Dv360Adapter({
        clientId:
          process.env.DV360_CLIENT_ID ||
          '1008395844479-ah78ti7vhav9d37b7om5ubifsfs8m3i6.apps.googleusercontent.com',
        clientSecret: process.env.DV360_CLIENT_SECRET || '',
        redirectUri:
          body.redirectUri ||
          process.env.DV360_REDIRECT_URI ||
          'http://localhost:8000/api/v1/dv360/redirect',
      });

      const tokens = await adapter.exchangeCodeForTokens(body.code);

      if (body.userId && tokens.access_token) {
        await this.integrationTokenService.saveToken(body.userId, 'dv360', {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? undefined,
          expiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : undefined,
          scope: tokens.scope ?? undefined,
        });
      }

      return {
        token: tokens,
        authorization: tokens.access_token
          ? `Bearer ${tokens.access_token}`
          : null,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to exchange DV360 code: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async resolveAccessToken(
    authorization?: string,
    userId?: string,
  ): Promise<string> {
    const fromHeader = this.extractAccessToken(authorization);
    if (fromHeader) return fromHeader;

    if (!userId) {
      throw new HttpException(
        'Missing Authorization header. Use Bearer <accessToken> or provide userId.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const stored = await this.integrationTokenService.getToken(userId, 'dv360');
    if (!stored) {
      throw new HttpException(
        `No stored DV360 token found for userId=${userId}. Exchange a code first.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!stored.isExpired) return stored.accessToken;

    // Token expired — try to refresh
    if (!stored.refreshToken) {
      throw new HttpException(
        'DV360 access token expired and no refresh token is stored. Please re-authenticate.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const adapter = new Dv360Adapter({
      clientId:
        process.env.DV360_CLIENT_ID ||
        '1008395844479-ah78ti7vhav9d37b7om5ubifsfs8m3i6.apps.googleusercontent.com',
      clientSecret: process.env.DV360_CLIENT_SECRET || '',
      redirectUri:
        process.env.DV360_REDIRECT_URI ||
        'http://localhost:8000/api/v1/dv360/redirect',
    });
    adapter.setCredentials(stored.accessToken, stored.refreshToken);
    const refreshed = await adapter.refreshAccessToken();

    await this.integrationTokenService.saveToken(userId, 'dv360', {
      accessToken: refreshed.access_token!,
      refreshToken: refreshed.refresh_token ?? stored.refreshToken,
      expiresAt: refreshed.expiry_date
        ? new Date(refreshed.expiry_date)
        : undefined,
    });

    return refreshed.access_token!;
  }

  async listPartners(
    pageSize: number,
    authorization?: string,
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveAccessToken(authorization, userId);

      this.dv360Adapter.setCredentials(accessToken);
      const data = await this.dv360Adapter.listPartners(pageSize);
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to list DV360 partners: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listAdvertisers(
    partnerId: string,
    pageSize: number,
    authorization?: string,
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveAccessToken(authorization, userId);

      this.dv360Adapter.setCredentials(accessToken);
      const data = await this.dv360Adapter.listAdvertisers(partnerId, pageSize);
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to list DV360 advertisers: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listCampaigns(
    advertiserId: string,
    pageSize: number,
    authorization?: string,
    userId?: string,
  ) {
    try {
      const accessToken = await this.resolveAccessToken(authorization, userId);

      this.dv360Adapter.setCredentials(accessToken);
      const data = await this.dv360Adapter.listCampaigns(
        advertiserId,
        pageSize,
      );
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to list DV360 campaigns: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
