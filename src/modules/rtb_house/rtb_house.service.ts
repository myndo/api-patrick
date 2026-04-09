import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { FilterGroup, Prisma } from '../../app/database/prisma';
import { RTBHouseServiceAdapter } from '../integrations/rtbhouse-service-adapter';
import {
  CreateJobOptions,
  CreateJobFromRTBHouseOptions,
  GetOneJobSelections,
  JobSelect,
  UpdateJobOptions,
  UpdateJobSelections,
} from './rtb_house.type';

@Injectable()
export class JobsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll() {
    const where: FilterGroup<Prisma.RTBHouseReportWhereInput> = {
      deletedAt: null,
      AND: [],
    };

    const jobs = await this.client.rTBHouseReport.findMany({ where });

    return jobs;
  }

  /** Find one Job in database. */
  async findOneBy(selections: GetOneJobSelections) {
    const where: FilterGroup<Prisma.RTBHouseReportWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    const { jobId } = selections;

    if (jobId) {
      where.AND.push({ id: jobId });
    }

    const organization = await this.client.rTBHouseReport.findFirst({
      where,
      select: JobSelect,
    });

    return organization;
  }

  /** Create one Job in database. */
  async createOne(options: CreateJobOptions) {
    return await this.client.rTBHouseReport.create({
      data: options,
    });
  }

  /** Update one Job in database. */
  async updateOne({ jobId }: UpdateJobSelections, options: UpdateJobOptions) {
    return await this.client.rTBHouseReport.update({
      where: { id: jobId },
      data: options,
    });
  }

  /** Fetch and save RTBHouse data */
  async fetchAndSaveRTBHouseData(
    dayFrom: string,
    dayTo: string,
    config: {
      baseUrl: string;
      advertiserId: string;
      username?: string;
      password?: string;
      refreshToken?: string;
    },
  ) {
    const rtbHouseService = new RTBHouseServiceAdapter(config);

    // Fetch merged data from RTBHouse
    const mergedData = await rtbHouseService.fetchAndMergeMetrics(
      dayFrom,
      dayTo,
    );

    const savedJobs = [];

    // Save each record to the database
    for (const data of mergedData) {
      const jobData: CreateJobFromRTBHouseOptions = {
        day: new Date(data.day),
        campaign: data.campaign,
        status: data.status,
        clicksCount: data.clicksCount || 0,
        conversionsCount: data.conversionsCount || 0,
        clientName: data.client_name,
        conversionsValue: data.conversionsValue || 0,
        country: data.country,
        currency: data.currency,
        impsCount: data.impsCount || 0,
        campaignCost: data.campaignCost || 0,
        userSegment: data.userSegment,
        provider: 'RTBHouse',
      };

      const savedJob = await this.createOne(jobData);
      savedJobs.push(savedJob);
    }

    return {
      totalRecords: savedJobs.length,
      jobs: savedJobs,
    };
  }
}
