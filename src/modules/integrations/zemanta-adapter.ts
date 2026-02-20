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

export interface ZemantaCreditItem {
  id: string;
  startDate: string;
  endDate: string;
  createdOn: string;
  total: string;
  allocated: string;
  available: string;
  currency: string;
}

export interface ZemantaCreditListResponse {
  data: ZemantaCreditItem[];
}

export interface ZemantaCreditDetailsResponse {
  data: ZemantaCreditItem;
}

export interface ZemantaSource {
  slug: string;
  name: string;
  auditors: string[];
}

export interface ZemantaSourcesResponse {
  data: ZemantaSource[];
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

export interface ZemantaCampaignBudgetsResponse {
  data: ZemantaBudgetItem[];
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
  private async setAuthHeader() {
    const token = await this.getAccessToken();
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * List all accounts
   */
  async listAccounts(params?: {
    includeArchived?: boolean;
    includeDeliveryStatus?: boolean;
  }): Promise<ZemantaAccount[]> {
    await this.setAuthHeader();

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
  ): Promise<ZemantaAccount> {
    await this.setAuthHeader();

    const response = await this.client.get<ZemantaAccountDetailsResponse>(
      `/rest/v1/accounts/${accountId}`,
      {
        params: { includeDeliveryStatus },
      },
    );

    return response.data.data;
  }

  /**
   * Update account details
   */
  async updateAccount(
    accountId: string,
    updates: Partial<ZemantaAccount>,
  ): Promise<ZemantaAccount> {
    await this.setAuthHeader();

    const response = await this.client.put<ZemantaAccountDetailsResponse>(
      `/rest/v1/accounts/${accountId}`,
      updates,
    );

    return response.data.data;
  }

  /**
   * Create a new account
   */
  async createAccount(
    accountData: Partial<ZemantaAccount>,
  ): Promise<ZemantaAccount> {
    await this.setAuthHeader();

    const response = await this.client.post<ZemantaAccountDetailsResponse>(
      '/rest/v1/accounts/',
      accountData,
    );

    return response.data.data;
  }

  /**
   * Get account sources
   */
  async getAccountSources(accountId: string): Promise<ZemantaSource[]> {
    await this.setAuthHeader();

    const response = await this.client.get<ZemantaSourcesResponse>(
      `/rest/v1/accounts/${accountId}/sources/`,
    );

    return response.data.data;
  }

  /**
   * Get active credit items for account
   */
  async getAccountCredits(accountId: string): Promise<ZemantaCreditItem[]> {
    await this.setAuthHeader();

    const response = await this.client.get<ZemantaCreditListResponse>(
      `/rest/v1/accounts/${accountId}/credits/`,
    );

    return response.data.data;
  }

  /**
   * Get specific credit item for account
   */
  async getAccountCreditDetails(
    accountId: string,
    creditId: string,
  ): Promise<ZemantaCreditItem> {
    await this.setAuthHeader();

    const response = await this.client.get<ZemantaCreditDetailsResponse>(
      `/rest/v1/accounts/${accountId}/credits/${creditId}`,
    );

    return response.data.data;
  }

  /**
   * List campaigns with optional filters
   */
  async listCampaigns(params?: {
    includeArchived?: boolean;
    includeGoals?: boolean;
    includeBudgets?: boolean;
    includeDeliveryStatus?: boolean;
    accountId?: string;
    excludeInactive?: boolean;
  }): Promise<ZemantaCampaign[]> {
    await this.setAuthHeader();

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
          const account = await this.getAccountDetails(accountId);
          accountsMap.set(accountId, account);
        } catch (error) {
          console.warn(
            `Failed to fetch account details for ${accountId}:`,
            error.message,
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
  ): Promise<(ZemantaCampaign & { stats?: ZemantaCampaignStats })[]> {
    await this.setAuthHeader();

    // Fetch all campaigns
    const campaigns = await this.listCampaigns(params);

    // Fetch stats for each campaign in parallel
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const stats = await this.getCampaignStats(campaign.id, from, to);
          return { ...campaign, stats };
        } catch (error) {
          // If stats fetch fails for a campaign, return campaign without stats
          console.warn(
            `Failed to fetch stats for campaign ${campaign.id}:`,
            error.message,
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
  ): Promise<ZemantaCampaignStats> {
    await this.setAuthHeader();

    const response = await this.client.get<ZemantaCampaignStatsResponse>(
      `/rest/v1/campaigns/${campaignId}/stats/`,
      {
        params: { from, to },
      },
    );

    return response.data.data;
  }

  /**
   * Get campaign budgets
   */
  async getCampaignBudgets(campaignId: string): Promise<ZemantaBudgetItem[]> {
    await this.setAuthHeader();

    const response = await this.client.get<ZemantaCampaignBudgetsResponse>(
      `/rest/v1/campaigns/${campaignId}/budgets/`,
    );

    return response.data.data;
  }

  /**
   * Get campaign details (budgets and optionally stats)
   */
  async getCampaignDetails(
    campaignId: string,
    from?: string,
    to?: string,
  ): Promise<{
    data: { budgets: ZemantaBudgetItem[]; stats?: ZemantaCampaignStats };
  }> {
    await this.setAuthHeader();

    const budgetsPromise = this.client.get<ZemantaCampaignBudgetsResponse>(
      `/rest/v1/campaigns/${campaignId}/budgets/`,
    );

    // Only fetch stats if date range is provided
    const statsPromise =
      from && to
        ? this.client.get<ZemantaCampaignStatsResponse>(
            `/rest/v1/campaigns/${campaignId}/stats/`,
            { params: { from, to } },
          )
        : null;

    const [budgetsResponse, statsResponse] = await Promise.all([
      budgetsPromise,
      statsPromise,
    ]);

    const data: {
      budgets: ZemantaBudgetItem[];
      stats?: ZemantaCampaignStats;
    } = {
      budgets: budgetsResponse.data.data,
    };

    if (statsResponse) {
      data.stats = statsResponse.data.data;
    }

    return { data };
  }
}
