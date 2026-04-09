import { Prisma, RTBHouseReport } from '../../app/database/prisma';
import { PrismaPagination } from '../../app/utils/pagination';

export type GetJobSelections = {
  search?: string;
  pagination?: PrismaPagination;
};

export type GetOneJobSelections = {
  jobId?: RTBHouseReport['id'];
};

export type UpdateJobSelections = {
  jobId: RTBHouseReport['id'];
};

export type CreateJobOptions = Prisma.RTBHouseReportCreateInput;
export type UpdateJobOptions = Prisma.RTBHouseReportUpdateInput;

export const JobSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  day: true,
  campaign: true,
  investment: true,
  status: true,
  clicksCount: true,
  conversionsCount: true,
  clientName: true,
  conversionsValue: true,
  country: true,
  currency: true,
  impsCount: true,
  campaignCost: true,
  userSegment: true,
  provider: true,
  providerJobId: true,
};

export type CreateJobFromRTBHouseOptions = {
  day: Date;
  campaign: string;
  status: string;
  clicksCount: number;
  conversionsCount: number;
  clientName: string;
  conversionsValue: number;
  country: string;
  currency: string;
  impsCount: number;
  campaignCost: number;
  userSegment: string;
  provider: string;
};
