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
  date: true,
  campaignId: true,
  campaignName: true,
  status: true,
  clicks: true,
  impressions: true,
  conversions: true,
  conversionValue: true,
  country: true,
  currency: true,
  cost: true,
};

export type CreateTradeDoublerReportOptions =
  Prisma.TradeDoublerReportCreateInput;
