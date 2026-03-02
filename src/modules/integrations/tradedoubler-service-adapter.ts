import axios from 'axios';

export interface TradeDoublerConfig {
  apiToken: string;
  baseUrl?: string;
}

export interface TradeDoublerCampaign {
  campaignId: number;
  campaignName: string;
  status: string;
  startDate?: string;
  endDate?: string;
  currency: string;
}

export interface TradeDoublerPerformanceData {
  date: string;
  campaignId: number;
  campaignName: string;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
  cost: number;
  country?: string;
  status: string;
}

export interface TradeDoublerMergedData {
  date: string;
  campaignId: number;
  campaignName: string;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
  cost: number;
  country?: string;
  status: string;
  currency: string;
}

export class TradeDoublerServiceAdapter {
  private config: TradeDoublerConfig;
  private baseUrl: string;

  constructor(config: TradeDoublerConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.tradedoubler.com/v2';
  }

  private getAuthHeader(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchCampaigns(): Promise<TradeDoublerCampaign[]> {
    try {
      const url = `${this.baseUrl}/campaigns`;

      const response = await axios.get(url, {
        headers: this.getAuthHeader(),
      });

      return response.data.campaigns || response.data.data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch TradeDoubler campaigns: ${error.message}`,
      );
    }
  }

  async fetchPerformanceData(
    campaignId: number,
    dateFrom: string,
    dateTo: string,
    groupBy?: string,
  ): Promise<TradeDoublerPerformanceData[]> {
    try {
      let url =
        `${this.baseUrl}/reports/performance` +
        `?campaignId=${campaignId}` +
        `&dateFrom=${dateFrom}` +
        `&dateTo=${dateTo}`;

      if (groupBy) {
        url += `&groupBy=${groupBy}`;
      }

      const response = await axios.get(url, {
        headers: this.getAuthHeader(),
      });

      return response.data.reports || response.data.data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch TradeDoubler performance data: ${error.message}`,
      );
    }
  }

  async fetchConversions(
    campaignId: number,
    dateFrom: string,
    dateTo: string,
  ): Promise<any[]> {
    try {
      const url =
        `${this.baseUrl}/reports/conversions` +
        `?campaignId=${campaignId}` +
        `&dateFrom=${dateFrom}` +
        `&dateTo=${dateTo}`;

      const response = await axios.get(url, {
        headers: this.getAuthHeader(),
      });

      return response.data.conversions || response.data.data || [];
    } catch (error) {
      throw new Error(
        `Failed to fetch TradeDoubler conversions: ${error.message}`,
      );
    }
  }

  async fetchAndMergeMetrics(
    dateFrom: string,
    dateTo: string,
  ): Promise<TradeDoublerMergedData[]> {
    try {
      const resultsByKey: Record<string, TradeDoublerMergedData> = {};

      // Fetch all campaigns
      const campaigns = await this.fetchCampaigns();

      const campaignStatusMap: Record<string, string> = {};
      const campaignCurrencyMap: Record<string, string> = {};

      campaigns.forEach((campaign) => {
        campaignStatusMap[campaign.campaignId] = campaign.status;
        campaignCurrencyMap[campaign.campaignId] = campaign.currency || 'EUR';
      });

      // Fetch performance data for each campaign
      for (const campaign of campaigns) {
        const performanceData = await this.fetchPerformanceData(
          campaign.campaignId,
          dateFrom,
          dateTo,
          'date-country',
        );

        performanceData.forEach((row) => {
          const key = `${row.date}_${campaign.campaignId}_${row.country || 'GLOBAL'}`;

          if (!resultsByKey[key]) {
            resultsByKey[key] = {
              date: row.date,
              campaignId: campaign.campaignId,
              campaignName: campaign.campaignName,
              clicks: row.clicks || 0,
              impressions: row.impressions || 0,
              conversions: row.conversions || 0,
              conversionValue: row.conversionValue || 0,
              cost: row.cost || 0,
              country: row.country,
              status: campaignStatusMap[campaign.campaignId] || 'UNKNOWN',
              currency: campaignCurrencyMap[campaign.campaignId] || 'EUR',
            };
          } else {
            resultsByKey[key].clicks += row.clicks || 0;
            resultsByKey[key].impressions += row.impressions || 0;
            resultsByKey[key].conversions += row.conversions || 0;
            resultsByKey[key].conversionValue += row.conversionValue || 0;
            resultsByKey[key].cost += row.cost || 0;
          }
        });
      }

      // Convert object → array sorted by date, then campaignId, then country
      const sortedData = Object.values(resultsByKey).sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        const campaignCompare = a.campaignId - b.campaignId;
        if (campaignCompare !== 0) return campaignCompare;
        return (a.country || '').localeCompare(b.country || '');
      });

      return sortedData;
    } catch (error) {
      throw new Error(`Failed to merge TradeDoubler metrics: ${error.message}`);
    }
  }
}
