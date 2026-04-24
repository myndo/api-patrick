import axios from 'axios';

const TOKEN_URL = 'https://id.adform.com/sts/connect/token';
const API_BASE = 'https://api.adform.com/v1';
const SCOPES =
  'https://api.adform.com/scope/buyer.stats https://api.adform.com/scope/buyer.campaigns';

export interface AdformConfig {
  clientId: string;
  clientSecret: string;
}

export interface AdformTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AdformCampaign {
  id: number;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
}

export interface AdformStatsRequest {
  dateFrom: string;
  dateTo: string;
  dimensions: string[];
  metrics: string[];
  filter?: {
    campaigns?: number[];
    advertisers?: number[];
  };
}

export interface AdformStatsRow {
  [key: string]: string | number | null;
}

export interface AdformStatsResponse {
  reportData: {
    columns: string[];
    rows: AdformStatsRow[];
  };
}

export class AdformServiceAdapter {
  private config: AdformConfig;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: AdformConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: SCOPES,
    });

    const response = await axios.post<AdformTokenResponse>(
      TOKEN_URL,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    this.cachedToken = response.data.access_token;
    // Subtract 60 s buffer before expiry
    this.tokenExpiresAt = now + (response.data.expires_in - 60) * 1000;
    return this.cachedToken;
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchCampaigns(): Promise<AdformCampaign[]> {
    const response = await axios.get<AdformCampaign[]>(
      `${API_BASE}/buyer/campaigns`,
      {
        headers: await this.authHeaders(),
      },
    );
    return response.data;
  }

  async fetchStats(request: AdformStatsRequest): Promise<AdformStatsResponse> {
    const body = {
      reportSettings: {
        interval: {
          from: request.dateFrom,
          to: request.dateTo,
        },
      },
      dimensions: request.dimensions,
      metrics: request.metrics,
      ...(request.filter ? { filter: request.filter } : {}),
    };

    const response = await axios.post<AdformStatsResponse>(
      `${API_BASE}/buyer/stats/data`,
      body,
      { headers: await this.authHeaders() },
    );

    return response.data;
  }
}
