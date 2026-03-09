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

  private getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }

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
  async fetchAndSaveTradeDoublerData(dateFrom: string, dateTo: string) {
    const tradeDoublerService = new TradeDoublerServiceAdapter({
      secret: this.getRequiredEnv('TRADEDOUBLER_SECRET'),
      clientId: this.getRequiredEnv('TRADEDOUBLER_CLIENT_ID'),
      username: this.getRequiredEnv('TRADEDOUBLER_USERNAME'),
      password: this.getRequiredEnv('TRADEDOUBLER_PASSWORD'),
      organizationId:
        process.env.TRADEDOUBLER_ORGANIZATION_ID ||
        this.getRequiredEnv('TRADEDOUBLER_CLIENT_ID'),
      baseUrl:
        process.env.TRADEDOUBLER_BASE_URL || 'https://connect.tradedoubler.com',
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
        organizationName: data.organizationName,
        organizationId: data.organizationId,
        programName: data.programName,
        programId: data.programId,
        currency: data.currency,
        country: data.country,
        publisherCommission: data.publisherCommission,
        orderValue: data.orderValue,
        totalCommission: data.totalCommission,
        vatAmount: data.vatAmount,
        impressions: data.impressions,
        clicks: data.clicks,
        currencyCode: data.currencyCode,
      };

      // Check if this data point already exists
      const existing = await this.client.tradeDoublerReport.findFirst({
        where: {
          date: reportData.date,
          organizationId: reportData.organizationId,
          programId: reportData.programId,
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
