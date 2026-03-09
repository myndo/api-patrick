import axios from 'axios';

export interface TradeDoublerConfig {
  secret: string;
  clientId: string;
  username: string;
  password: string;
  organizationId?: string;
  baseUrl?: string;
}

export interface TradeDoublerReportData {
  date: string;
  organizationName: string;
  organizationId: string;
  programName: string;
  programId: string;
  currency: string;
  country: string;
  publisherCommission: number;
  orderValue: number;
  totalCommission: number;
  vatAmount: number;
  impressions: number;
  clicks: number;
  currencyCode: string;
}

interface AggregatedMetrics {
  [key: string]: Partial<TradeDoublerReportData>;
}

export class TradeDoublerServiceAdapter {
  private config: TradeDoublerConfig;
  private baseUrl: string;
  private bearerToken: string | null = null;

  constructor(config: TradeDoublerConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://connect.tradedoubler.com';
  }

  private async getBearerToken(): Promise<string> {
    if (this.bearerToken) {
      return this.bearerToken;
    }

    try {
      const url = `https://connect.tradedoubler.com/uaa/oauth/token`;
      console.log(`Attempting OAuth token endpoint: ${url}`);

      const encoded = Buffer.from(
        `${this.config.clientId}:${this.config.secret}`,
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', this.config.username);
      params.append('password', this.config.password);

      const response = await axios.post(url, params.toString(), {
        headers: {
          Authorization: `Basic ${encoded}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      });

      this.bearerToken = response.data.access_token;
      console.log(`Successfully obtained Bearer token`);
      return this.bearerToken;
    } catch (error) {
      throw new Error(
        `Failed to obtain Bearer token from TradeDoubler OAuth: ${error.message}`,
      );
    }
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await this.getBearerToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private mapReportRow(row: Record<string, any>): TradeDoublerReportData {
    return {
      date: row.date || new Date().toISOString(),
      organizationName: row.programName || '',
      organizationId: String(row.programId || this.config.organizationId || ''),
      programName: row.programName || '',
      programId: String(row.programId || ''),
      currency: row.reportCurrencyCode || 'EUR',
      country: row.country || 'GLOBAL',
      publisherCommission: Number(row.amount || 0),
      orderValue: Number(row.amount || 0),
      totalCommission: Number(row.amount || 0),
      vatAmount: Number(row.vatAmount || 0),
      impressions: 0,
      clicks: 0,
      currencyCode: row.reportCurrencyCode || 'EUR',
    };
  }

  async fetchProgramPerformance(
    dateFrom: string,
    dateTo: string,
  ): Promise<TradeDoublerReportData[]> {
    // Convert dateFrom/dateTo from YYYY-MM-DD to YYYYMMDD format for API
    const formattedFromDate = dateFrom.replace(/-/g, '');
    const formattedToDate = dateTo.replace(/-/g, '');

    if (!this.config.organizationId) {
      throw new Error('organizationId is required for TradeDoubler API');
    }

    const metrics: AggregatedMetrics = {};

    try {
      // Fetch from multiple endpoints and aggregate data
      await Promise.allSettled([
        this.fetchPrepaymentBalance(
          formattedFromDate,
          formattedToDate,
          metrics,
        ),
        this.fetchTransactions(formattedFromDate, formattedToDate, metrics),
      ]);

      // Convert aggregated metrics to final report data
      return Object.values(metrics)
        .map((metric) => ({
          date: metric.date || new Date().toISOString(),
          organizationName: metric.organizationName || '',
          organizationId:
            metric.organizationId || String(this.config.organizationId),
          programName: metric.programName || '',
          programId: metric.programId || '',
          currency: metric.currency || 'EUR',
          country: metric.country || 'GLOBAL',
          publisherCommission: metric.publisherCommission || 0,
          orderValue: metric.orderValue || 0,
          totalCommission: metric.totalCommission || 0,
          vatAmount: metric.vatAmount || 0,
          impressions: metric.impressions || 0,
          clicks: metric.clicks || 0,
          currencyCode: metric.currencyCode || 'EUR',
        }))
        .filter((item) => item.organizationId && item.programId && item.date);
    } catch (error) {
      throw new Error(
        `Failed to fetch TradeDoubler program performance: ${error.message}`,
      );
    }
  }

  private createMetricKey(
    date: string,
    organizationId: string | number,
    programId: string | number,
    country: string,
  ): string {
    return `${date}_${organizationId}_${programId}_${country}`;
  }

  private async fetchPrepaymentBalance(
    fromDate: string,
    toDate: string,
    metrics: AggregatedMetrics,
  ): Promise<void> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/advertiser/report/prepaymentbalance`,
        {
          headers: await this.getAuthHeader(),
          params: {
            fromDate,
            toDate,
            programId: Number(this.config.organizationId),
            reportCurrencyCode: 'EUR',
            limit: 100,
            offset: 0,
          },
        },
      );

      console.log(`Prepayment balance response:`, response.data);
      const items = response.data?.items || [];
      if (!Array.isArray(items)) return;

      items.forEach((row) => {
        const key = this.createMetricKey(
          row.date,
          row.programId,
          row.programId,
          'GLOBAL',
        );

        metrics[key] = metrics[key] || {};
        metrics[key].date = row.date;
        metrics[key].programId = String(row.programId);
        metrics[key].programName = row.programName;
        metrics[key].currency = row.reportCurrencyCode || 'EUR';
        metrics[key].currencyCode = row.reportCurrencyCode || 'EUR';
        metrics[key].totalCommission =
          (metrics[key].totalCommission || 0) + (Number(row.amount) || 0);
      });
    } catch (error) {
      if (error.response) {
        console.warn(
          `Failed to fetch prepayment balance: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      } else {
        console.warn('Failed to fetch prepayment balance:', error.message);
      }
    }
  }

  private async fetchTransactions(
    fromDate: string,
    toDate: string,
    metrics: AggregatedMetrics,
  ): Promise<void> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/advertiser/report/transactions`,
        {
          headers: await this.getAuthHeader(),
          params: {
            fromDate,
            toDate,
            reportCurrencyCode: 'EUR',
            limit: 100,
            offset: 0,
          },
        },
      );

      const items = response.data?.items || [];
      if (!Array.isArray(items)) return;

      items.forEach((row) => {
        const key = this.createMetricKey(
          row.date,
          row.programId,
          row.programId,
          row.country || 'GLOBAL',
        );

        metrics[key] = metrics[key] || {};
        metrics[key].date = row.date;
        metrics[key].programId = String(row.programId);
        metrics[key].programName = row.programName;
        metrics[key].country = row.country || 'GLOBAL';
        metrics[key].orderValue =
          (metrics[key].orderValue || 0) + (Number(row.orderValue) || 0);
        metrics[key].vatAmount =
          (metrics[key].vatAmount || 0) + (Number(row.vatAmount) || 0);
      });
    } catch (error) {
      if (error.response) {
        console.warn(
          `Failed to fetch transactions: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      } else {
        console.warn('Failed to fetch transactions:', error.message);
      }
    }
  }

  private async fetchClicks(
    fromDate: string,
    toDate: string,
    metrics: AggregatedMetrics,
  ): Promise<void> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/advertiser/report/clicks`,
        {
          headers: await this.getAuthHeader(),
          params: {
            fromDate,
            toDate,
            limit: 100,
            offset: 0,
          },
        },
      );

      const items = response.data?.items || [];
      if (!Array.isArray(items)) return;

      items.forEach((row) => {
        const key = this.createMetricKey(
          row.date,
          row.programId,
          row.programId,
          row.country || 'GLOBAL',
        );

        metrics[key] = metrics[key] || {};
        metrics[key].date = row.date;
        metrics[key].programId = String(row.programId);
        metrics[key].programName = row.programName;
        metrics[key].country = row.country || 'GLOBAL';
        metrics[key].clicks =
          (metrics[key].clicks || 0) + (Number(row.clicks) || 0);
      });
    } catch (error) {
      if (error.response) {
        console.warn(
          `Failed to fetch clicks: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      } else {
        console.warn('Failed to fetch clicks:', error.message);
      }
    }
  }

  async fetchAndMergeMetrics(
    dateFrom: string,
    dateTo: string,
  ): Promise<TradeDoublerReportData[]> {
    try {
      const rows = await this.fetchProgramPerformance(dateFrom, dateTo);

      return rows.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } catch (error) {
      throw new Error(`Failed to merge TradeDoubler metrics: ${error.message}`);
    }
  }
}
