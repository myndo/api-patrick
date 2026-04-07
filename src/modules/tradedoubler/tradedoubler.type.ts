import { Prisma } from '../../app/database/prisma';

export type GetTradeDoublerSelections = {
  reportId?: string;
};

export type UpdateTradeDoublerSelections = {
  reportId: string;
};

export type CreateTradeDoublerOptions = Prisma.TradeDoublerReportCreateInput;
export type UpdateTradeDoublerOptions = Prisma.TradeDoublerReportUpdateInput;

export const TradeDoublerSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  userId: true,
  date: true,
  organizationName: true,
  organizationId: true,
  campaignName: true,
  programId: true,
  currency: true,
  country: true,
  publisherCommission: true,
  orderValue: true,
  totalCommission: true,
  vatAmount: true,
  impressions: true,
  clicks: true,
  currencyCode: true,
};

export type CreateTradeDoublerReportOptions =
  Prisma.TradeDoublerReportCreateInput;
