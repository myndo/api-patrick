import axios from 'axios';

const TOKEN_URL = 'https://id.adform.com/sts/connect/token';
const API_BASE = 'https://api.adform.com/v1';

export interface AdformConfig {
  clientId: string;
  clientSecret: string;
  /** Optional OAuth scopes. When omitted, Adform uses the default scopes granted to the client. */
  scope?: string;
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

  async requestAccessToken(): Promise<AdformTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    // Only include scope if explicitly provided; omitting it lets Adform
    // use the default scopes already granted to this client.
    const scope = this.config.scope ?? process.env.ADFORM_SCOPES;
    if (scope) params.set('scope', scope);

    const response = await axios.post<AdformTokenResponse>(
      TOKEN_URL,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const now = Date.now();
    this.cachedToken = response.data.access_token;
    this.tokenExpiresAt = now + (response.data.expires_in - 60) * 1000;

    return response.data;
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const token = await this.requestAccessToken();
    return token.access_token;
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
