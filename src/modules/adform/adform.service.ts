import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  AdformServiceAdapter,
  AdformStatsRequest,
} from '../integrations/adform-adapter';
import { FetchAdformStatsDto } from './adform.dto';

const DEFAULT_DIMENSIONS = ['date', 'campaign', 'campaignId'];
const DEFAULT_METRICS = [
  'impressions',
  'clicks',
  'spend',
  'ctr',
  'cpm',
  'conversions',
];

@Injectable()
export class AdformService {
  private adapter: AdformServiceAdapter;

  constructor() {
    this.adapter = new AdformServiceAdapter({
      clientId: process.env.ADFORM_CLIENT_ID || '',
      clientSecret: process.env.ADFORM_CLIENT_SECRET || '',
    });
  }

  async getCampaigns() {
    try {
      const campaigns = await this.adapter.fetchCampaigns();
      return { count: campaigns.length, campaigns };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch Adform campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStats(dto: FetchAdformStatsDto) {
    try {
      const request: AdformStatsRequest = {
        dateFrom: dto.dateFrom,
        dateTo: dto.dateTo,
        dimensions: dto.dimensions ?? DEFAULT_DIMENSIONS,
        metrics: dto.metrics ?? DEFAULT_METRICS,
        ...(dto.campaignIds?.length || dto.advertiserIds?.length
          ? {
              filter: {
                ...(dto.campaignIds?.length
                  ? { campaigns: dto.campaignIds }
                  : {}),
                ...(dto.advertiserIds?.length
                  ? { advertisers: dto.advertiserIds }
                  : {}),
              },
            }
          : {}),
      };

      const stats = await this.adapter.fetchStats(request);
      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch Adform stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
