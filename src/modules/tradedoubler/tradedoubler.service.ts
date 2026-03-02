import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { TradeDoublerServiceAdapter } from '../integrations/tradedoubler-service-adapter';
import {
  CreateTradeDoublerOptions,
  GetTradeDoublerSelections,
  TradeDoublerSelect,
  UpdateTradeDoublerOptions,
  UpdateTradeDoublerSelections,
} from './tradedoubler.type';

@Injectable()
export class TradeDoublerJobsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll() {
    const reports = await this.client.tradeDoublerReport.findMany({
      where: { deletedAt: null },
    });

    return reports;
  }

  /** Find one TradeDoubler Report in database. */
  async findOneBy(selections: GetTradeDoublerSelections) {
    const { reportId } = selections;

    if (!reportId) {
      return null;
    }

    const report = await this.client.tradeDoublerReport.findFirst({
      where: { id: reportId, deletedAt: null },
      select: TradeDoublerSelect,
    });

    return report;
  }

  /** Create one TradeDoubler Report in database. */
  async createOne(options: CreateTradeDoublerOptions) {
    return await this.client.tradeDoublerReport.create({
      data: options,
    });
  }

  /** Update one TradeDoubler Report in database. */
  async updateOne(
    { reportId }: UpdateTradeDoublerSelections,
    options: UpdateTradeDoublerOptions,
  ) {
    return await this.client.tradeDoublerReport.update({
      where: { id: reportId },
      data: options,
    });
  }

  /** Fetch and save TradeDoubler data */
  async fetchAndSaveTradeDoublerData(
    dateFrom: string,
    dateTo: string,
    config: {
      apiToken: string;
    },
  ) {
    const tradeDoublerService = new TradeDoublerServiceAdapter({
      ...config,
      baseUrl: 'https://api.tradedoubler.com/v2',
    });

    // Fetch merged data from TradeDoubler
    const mergedData = await tradeDoublerService.fetchAndMergeMetrics(
      dateFrom,
      dateTo,
    );

    // Save each data point to the database
    for (const data of mergedData) {
      const reportData: CreateTradeDoublerOptions = {
        date: new Date(data.date),
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        status: data.status,
        clicks: data.clicks,
        impressions: data.impressions,
        conversions: data.conversions,
        conversionValue: data.conversionValue,
        country: data.country,
        currency: data.currency,
        cost: data.cost,
      };

      // Check if this data point already exists
      const existing = await this.client.tradeDoublerReport.findFirst({
        where: {
          date: reportData.date,
          campaignId: reportData.campaignId,
          country: reportData.country,
        },
      });

      if (existing) {
        // Update existing record
        await this.updateOne({ reportId: existing.id }, reportData);
      } else {
        // Create new record
        await this.createOne(reportData);
      }
    }

    return mergedData;
  }
}
