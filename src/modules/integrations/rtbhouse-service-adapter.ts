import axios from 'axios';

export interface RTBHouseConfig {
  baseUrl: string;
  advertiserId: string;
  username?: string;
  password?: string;
  refreshToken?: string;
}

export interface RTBHouseMetricData {
  day: string;
  country: string;
  userSegment: string;
  subcampaign: string;
  conversionsValue?: number;
  conversionsCount?: number;
  campaignCost?: number;
  impsCount?: number;
  clicksCount?: number;
}

export interface RTBHouseMergedData {
  day: string;
  country: string;
  userSegment: string;
  campaign: string;
  status: string;
  client_name: string;
  currency: string;
  conversionsValue?: number;
  conversionsCount?: number;
  campaignCost?: number;
  impsCount?: number;
  clicksCount?: number;
}

export interface RTBHouseCampaign {
  name: string;
  status: string;
  hash: string;
}

export interface RTBHouseAdvertiser {
  hash: string;
  name: string;
  currency: string;
  features?: {
    enabled: string[];
  };
}

export class RTBHouseServiceAdapter {
  private config: RTBHouseConfig;
  private accessToken: string | null = null;

  constructor(config: RTBHouseConfig) {
    this.config = config;
    if (config.refreshToken) {
      this.accessToken = config.refreshToken;
    }
  }

  private getAuthHeader(): string {
    if (this.accessToken) {
      return `Bearer ${this.accessToken}`;
    }

    if (!this.config.username || !this.config.password) {
      throw new Error('No authentication available');
    }

    const credentials = `${this.config.username}:${this.config.password}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  }

  private async getAuthHeaderAsync(): Promise<string> {
    if (this.config.refreshToken) {
      return `Bearer ${this.config.refreshToken}`;
    }

    if (this.config.username && this.config.password) {
      return this.getAuthHeader();
    }

    throw new Error(
      'No authentication available. Provide refreshToken or username/password',
    );
  }

  async fetchCampaigns(): Promise<RTBHouseCampaign[]> {
    const url = `${this.config.baseUrl}/advertisers/${this.config.advertiserId}/campaigns`;

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  }

  async fetchAdvertisers(): Promise<RTBHouseAdvertiser[]> {
    const url = `${this.config.baseUrl}/advertisers`;

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  }

  async fetchAdvertiserHashes(): Promise<string[]> {
    const url = `${this.config.baseUrl}/advertisers?fields=hash`;

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return rows
      .map((item: Record<string, any>) => item?.hash)
      .filter(
        (hash: unknown): hash is string =>
          typeof hash === 'string' && hash.trim().length > 0,
      );
  }

  async fetchClientInfo(advertiserId: string): Promise<Record<string, any>> {
    const url = `${this.config.baseUrl}/advertisers/${advertiserId}/client`;

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    return response.data || {};
  }

  async fetchAdvertiserInfo(
    advertiserId: string,
  ): Promise<Record<string, any>> {
    const url = `${this.config.baseUrl}/advertisers/${advertiserId}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    return response.data || {};
  }

  async fetchUserInfo(): Promise<Record<string, any>> {
    const url = `${this.config.baseUrl}/user/info`;

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    return response.data || {};
  }

  async fetchMetric(
    metric: string,
    dayFrom: string,
    dayTo: string,
    countConvention?: string,
  ): Promise<RTBHouseMetricData[]> {
    let url =
      `${this.config.baseUrl}/advertisers/${this.config.advertiserId}/rtb-stats` +
      `?dayFrom=${dayFrom}` +
      `&dayTo=${dayTo}` +
      `&groupBy=day-country-userSegment-subcampaign` +
      `&metrics=${metric}`;

    if (countConvention) {
      url += `&countConvention=${countConvention}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: await this.getAuthHeaderAsync(),
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  }

  async fetchAndMergeMetrics(
    dayFrom: string,
    dayTo: string,
  ): Promise<RTBHouseMergedData[]> {
    const resultsByKey: Record<string, RTBHouseMergedData> = {};

    // Fetch campaigns to get status mapping
    const campaigns = await this.fetchCampaigns();
    const campaignStatusMap: Record<string, string> = {};
    campaigns.forEach((campaign) => {
      campaignStatusMap[campaign.name] = campaign.status;
    });

    // Fetch advertisers to get name, currency, and enabled features
    const advertisers = await this.fetchAdvertisers();
    const advertiser = advertisers.find(
      (adv) => adv.hash === this.config.advertiserId,
    );
    const advertiserName = advertiser?.name || 'Unknown';
    const advertiserCurrency = advertiser?.currency || 'USD';

    // Metrics that require countConvention
    const metricsWithConvention = ['conversionsValue', 'conversionsCount'];
    const countConvention = 'ATTRIBUTED';

    for (const metric of metricsWithConvention) {
      const data = await this.fetchMetric(
        metric,
        dayFrom,
        dayTo,
        countConvention,
      );

      data.forEach((row) => {
        const key = `${row.day}_${row.country}_${row.userSegment}_${row.subcampaign}`;
        if (!resultsByKey[key]) {
          resultsByKey[key] = {
            day: row.day,
            country: row.country,
            userSegment: row.userSegment,
            campaign: row.subcampaign,
            status: campaignStatusMap[row.subcampaign] || 'UNKNOWN',
            client_name: advertiserName,
            currency: advertiserCurrency,
          };
        }
        resultsByKey[key][metric] = row[metric];
      });
    }

    // Metrics that do not require countConvention
    const metricsNoConvention = ['campaignCost', 'impsCount', 'clicksCount'];

    for (const metric of metricsNoConvention) {
      const data = await this.fetchMetric(metric, dayFrom, dayTo);

      data.forEach((row) => {
        const key = `${row.day}_${row.country}_${row.userSegment}_${row.subcampaign}`;
        if (!resultsByKey[key]) {
          resultsByKey[key] = {
            day: row.day,
            country: row.country,
            userSegment: row.userSegment,
            campaign: row.subcampaign,
            status: campaignStatusMap[row.subcampaign] || 'UNKNOWN',
            client_name: advertiserName,
            currency: advertiserCurrency,
          };
        }
        resultsByKey[key][metric] = row[metric];
      });
    }

    // Convert object → array sorted by day, then country, then userSegment
    const sortedData = Object.values(resultsByKey).sort((a, b) => {
      const dateCompare = new Date(a.day).getTime() - new Date(b.day).getTime();
      if (dateCompare !== 0) return dateCompare;
      const countryCompare = (a.country || '').localeCompare(b.country || '');
      if (countryCompare !== 0) return countryCompare;
      return (a.userSegment || '').localeCompare(b.userSegment || '');
    });

    return sortedData;
  }
}
