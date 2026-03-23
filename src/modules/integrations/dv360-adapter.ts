import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface Dv360Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class Dv360Adapter {
  private oauth2Client: OAuth2Client;
  private displayvideo: any;

  constructor(config: Dv360Config) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );

    this.displayvideo = google.displayvideo({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  generateAuthUrl(
    scopes: string[] = ['https://www.googleapis.com/auth/display-video'],
  ): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async listPartners(pageSize: number = 100) {
    const response = await this.displayvideo.partners.list({
      pageSize,
    });

    return response.data;
  }

  async listAdvertisers(partnerId: string, pageSize: number = 100) {
    const response = await this.displayvideo.advertisers.list({
      partnerId,
      pageSize,
    });

    return response.data;
  }

  async listCampaigns(advertiserId: string, pageSize: number = 100) {
    const response = await this.displayvideo.advertisers.campaigns.list({
      advertiserId,
      pageSize,
    });

    return response.data;
  }
}
