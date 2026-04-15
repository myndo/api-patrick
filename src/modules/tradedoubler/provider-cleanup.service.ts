import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../app/database/database.service';

@Injectable()
export class ProviderCleanupService {
  private readonly logger = new Logger(ProviderCleanupService.name);
  private static readonly RETENTION_DAYS = 7;

  constructor(private readonly client: DatabaseService) {}

  private getCutoffDate(): Date {
    return new Date(
      Date.now() - ProviderCleanupService.RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
  }

  async deleteOldProviderJobs() {
    const cutoff = this.getCutoffDate();

    const deletedJobs = await this.client.providerJob.deleteMany({
      where: {
        provider: {
          in: ['tradedoubler', 'rtbhouse', 'zemanta'],
        },
        createdAt: { lte: cutoff },
        status: { in: [2, -1] },
      },
    });

    return { deletedJobs: deletedJobs.count };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    const result = await this.deleteOldProviderJobs();

    if (result.deletedJobs === 0) {
      return;
    }

    this.logger.log(
      `Deleted ${result.deletedJobs} provider jobs older than ${ProviderCleanupService.RETENTION_DAYS} days. Linked report rows were removed by FK cascade.`,
    );
  }
}
