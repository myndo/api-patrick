import axios, { AxiosInstance } from 'axios';

export interface ZemantaConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface ZemantaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface ZemantaAccount {
  id: string;
  agencyId: string;
  name: string;
  archived?: boolean;
  targeting?: {
    publisherGroups?: {
      included?: string[];
      excluded?: string[];
    };
    keywordLists?: {
      excluded?: string[];
    };
  };
  currency?: string;
  frequencyCapping?: number;
  defaultIconUrl?: string;
  defaultBrandName?: string;
  deliveryStatus?: string;
  inventoryAccessLevel?: string;
}

export interface ZemantaAccountListResponse {
  data: ZemantaAccount[];
}

export interface ZemantaAccountDetailsResponse {
  data: ZemantaAccount;
}

export interface ZemantaBudgetItem {
  id: string;
  creditId: string;
  amount: string;
  margin?: string;
  comment?: string;
  startDate: string;
  endDate: string;
  state: string;
  spend: string;
  available: string;
}

export interface ZemantaGoal {
  id: string;
  type: string;
  value?: string;
  primary: boolean;
  conversionGoal?: {
    type: string;
    name: string;
    goalId?: string;
    conversionDefinitionId?: string;
  };
}

export interface ZemantaCampaign {
  id: string;
  accountId: string;
  campaignManager?: string;
  name: string;
  archived?: boolean;
  iabCategory?: string;
  tracking?: any;
  targeting?: any;
  frequencyCapping?: number;
  deliveryStatus?: string;
  goals?: ZemantaGoal[];
  budgets?: ZemantaBudgetItem[];
  accountName?: string; // Enriched from account details
  currency?: string; // Enriched from account details
  agencyName?: string; // Enriched from account details (agencyId)
}

export interface ZemantaCampaignListResponse {
  data: ZemantaCampaign[];
}

export interface ZemantaCampaignStats {
  totalCost: string;
  impressions: number;
  clicks: number;
  cpc: string;
}

export interface ZemantaCampaignStatsResponse {
  data: ZemantaCampaignStats;
}

export class ZemantaAdapter {
  private client: AxiosInstance;
  private config: ZemantaConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(config: ZemantaConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://oneapi.zemanta.com',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get access token using OAuth2 client credentials flow
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date()
    ) {
      return this.accessToken;
    }

    // Create Basic Auth header
    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString('base64');

    const response = await axios.post<ZemantaTokenResponse>(
      `${this.config.baseUrl}/o/token/`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    this.accessToken = response.data.access_token;
    // Set expiration to 1 minute before actual expiry for safety
    this.tokenExpiresAt = new Date(
      Date.now() + (response.data.expires_in - 60) * 1000,
    );

    return this.accessToken;
  }

  /**
   * Set access token for API calls
   */
  private async setAuthHeader(accessToken?: string) {
    const token = accessToken || (await this.getAccessToken());
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * List all accounts
   */
  async listAccounts(
    params?: {
      includeArchived?: boolean;
      includeDeliveryStatus?: boolean;
    },
    accessToken?: string,
  ): Promise<ZemantaAccount[]> {
    await this.setAuthHeader(accessToken);

    const response = await this.client.get<ZemantaAccountListResponse>(
      '/rest/v1/accounts/',
      { params },
    );

    return response.data.data;
  }

  /**
   * Get account details by ID
   */
  async getAccountDetails(
    accountId: string,
    includeDeliveryStatus: boolean = false,
    accessToken?: string,
  ): Promise<ZemantaAccount> {
    await this.setAuthHeader(accessToken);

    const response = await this.client.get<ZemantaAccountDetailsResponse>(
      `/rest/v1/accounts/${accountId}`,
      {
        params: { includeDeliveryStatus },
      },
    );

    return response.data.data;
  }

  /**
   * List campaigns with optional filters
   */
  async listCampaigns(
    params?: {
      includeArchived?: boolean;
      includeGoals?: boolean;
      includeBudgets?: boolean;
      includeDeliveryStatus?: boolean;
      accountId?: string;
      excludeInactive?: boolean;
    },
    accessToken?: string,
  ): Promise<ZemantaCampaign[]> {
    await this.setAuthHeader(accessToken);

    const response = await this.client.get<ZemantaCampaignListResponse>(
      '/rest/v1/campaigns/',
      { params },
    );

    const campaigns = response.data.data;

    // Get unique account IDs
    const uniqueAccountIds = [
      ...new Set(campaigns.map((campaign) => campaign.accountId)),
    ];

    // Fetch account details for all unique accounts in parallel
    const accountsMap = new Map<string, ZemantaAccount>();
    await Promise.all(
      uniqueAccountIds.map(async (accountId) => {
        try {
          const account = await this.getAccountDetails(
            accountId,
            false,
            accessToken,
          );
          accountsMap.set(accountId, account);
        } catch (error) {
          console.warn(
            `Failed to fetch account details for ${accountId}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      }),
    );

    // Enrich campaigns with account information
    return campaigns.map((campaign) => {
      const account = accountsMap.get(campaign.accountId);
      return {
        ...campaign,
        accountName: account?.name,
        currency: account?.currency,
        agencyId: account?.agencyId,
      };
    });
  }

  /**
   * List campaigns with stats for each campaign
   */
  async listCampaignsWithStats(
    params: {
      includeArchived?: boolean;
      includeGoals?: boolean;
      includeBudgets?: boolean;
      includeDeliveryStatus?: boolean;
      accountId?: string;
      excludeInactive?: boolean;
    },
    from: string,
    to: string,
    accessToken?: string,
  ): Promise<(ZemantaCampaign & { stats?: ZemantaCampaignStats })[]> {
    await this.setAuthHeader(accessToken);

    // Fetch all campaigns
    const campaigns = await this.listCampaigns(params, accessToken);

    // Fetch stats for each campaign in parallel
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const stats = await this.getCampaignStats(
            campaign.id,
            from,
            to,
            accessToken,
          );
          return { ...campaign, stats };
        } catch (error) {
          // If stats fetch fails for a campaign, return campaign without stats
          console.warn(
            `Failed to fetch stats for campaign ${campaign.id}:`,
            error instanceof Error ? error.message : String(error),
          );
          return campaign;
        }
      }),
    );

    return campaignsWithStats;
  }

  /**
   * Get campaign performance statistics
   */
  async getCampaignStats(
    campaignId: string,
    from: string,
    to: string,
    accessToken?: string,
  ): Promise<ZemantaCampaignStats> {
    await this.setAuthHeader(accessToken);

    const response = await this.client.get<ZemantaCampaignStatsResponse>(
      `/rest/v1/campaigns/${campaignId}/stats/`,
      {
        params: { from, to },
      },
    );

    return response.data.data;
  }
}
