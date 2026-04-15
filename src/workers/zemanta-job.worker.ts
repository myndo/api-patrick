/**
 * Zemanta Job Worker
 */

// Load .env file when running as a standalone process
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { ZemantaAdapter } from '../modules/integrations/zemanta-adapter';
import { decrypt, encrypt } from '../modules/integrations/token-encryption';

type ZemantaCredentials = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
};

async function resolveCredentials(
  prisma: PrismaClient,
  userId: string,
  profileId?: string | null,
): Promise<ZemantaCredentials> {
  const record = profileId
    ? await prisma.integrationToken.findUnique({
        where: {
          profileId_provider: { profileId, provider: 'zemanta' },
        },
      })
    : await prisma.integrationToken.findFirst({
        where: { userId, provider: 'zemanta' },
        orderBy: { updatedAt: 'desc' },
      });

  if (!record) {
    throw new Error(
      `No Zemanta token stored for userId=${userId}. Login via /zemanta/users/register first.`,
    );
  }

  const metadata: Record<string, string> = record.metadata
    ? JSON.parse(decrypt(record.metadata))
    : {};

  const clientId = metadata.clientId;
  const clientSecret = metadata.clientSecret;
  const baseUrl = metadata.baseUrl || process.env.ZEMANTA_BASE_URL;

  if (!clientId || !clientSecret) {
    throw new Error(
      `Stored Zemanta credentials are incomplete for userId=${userId}. Please login again.`,
    );
  }

  const isExpired = record.expiresAt ? new Date() >= record.expiresAt : false;

  if (!isExpired) {
    return {
      accessToken: decrypt(record.accessToken),
      clientId,
      clientSecret,
      baseUrl,
    };
  }

  const adapter = new ZemantaAdapter({
    clientId,
    clientSecret,
    baseUrl,
  });

  const freshToken = await adapter.getAccessToken();
  const expiresAt = new Date(Date.now() + 55 * 60 * 1000);

  await prisma.integrationToken.update({
    where: { id: record.id },
    data: {
      accessToken: encrypt(freshToken),
      expiresAt,
    },
  });

  return {
    accessToken: freshToken,
    clientId,
    clientSecret,
    baseUrl,
  };
}

async function upsertZemantaReports(
  prisma: PrismaClient,
  campaigns: any[],
  from: string,
  to: string,
  providerJobId: string,
  userId: string,
  profileId?: string | null,
): Promise<number> {
  let savedCount = 0;

  for (const campaign of campaigns) {
    const campaignWithStats = campaign as any;

    if (campaign.budgets && campaign.budgets.length > 0) {
      for (const budget of campaign.budgets) {
        await prisma.zemantaReport.upsert({
          where: { id: budget.id },
          update: {
            providerJobId,
            userId,
            profileId: profileId || null,
            campaignId: campaign.id,
            budgetId: budget.id,
            accountId: campaign.accountId,
            accountName: campaign.accountName,
            currency: campaign.currency,
            agencyName: campaign.agencyName,
            campaignManager: campaign.campaignManager,
            campaignName: campaign.name,
            archived: campaign.archived || false,
            iabCategory: campaign.iabCategory,
            frequencyCapping: campaign.frequencyCapping,
            deliveryStatus: campaign.deliveryStatus,
            totalCost: campaignWithStats.stats?.totalCost,
            impressions: campaignWithStats.stats?.impressions,
            clicks: campaignWithStats.stats?.clicks,
            cpc: campaignWithStats.stats?.cpc,
            statsFrom: from ? new Date(from) : null,
            statsTo: to ? new Date(to) : null,
            creditId: budget.creditId,
            amount: budget.amount,
            margin: budget.margin,
            comment: budget.comment,
            budgetStartDate: new Date(budget.startDate),
            budgetEndDate: new Date(budget.endDate),
            budgetState: budget.state,
            spend: budget.spend,
            available: budget.available,
            updatedAt: new Date(),
          },
          create: {
            id: budget.id,
            providerJobId,
            userId,
            profileId: profileId || null,
            campaignId: campaign.id,
            budgetId: budget.id,
            accountId: campaign.accountId,
            accountName: campaign.accountName,
            currency: campaign.currency,
            agencyName: campaign.agencyName,
            campaignManager: campaign.campaignManager,
            campaignName: campaign.name,
            archived: campaign.archived || false,
            iabCategory: campaign.iabCategory,
            frequencyCapping: campaign.frequencyCapping,
            deliveryStatus: campaign.deliveryStatus,
            totalCost: campaignWithStats.stats?.totalCost,
            impressions: campaignWithStats.stats?.impressions,
            clicks: campaignWithStats.stats?.clicks,
            cpc: campaignWithStats.stats?.cpc,
            statsFrom: from ? new Date(from) : null,
            statsTo: to ? new Date(to) : null,
            creditId: budget.creditId,
            amount: budget.amount,
            margin: budget.margin,
            comment: budget.comment,
            budgetStartDate: new Date(budget.startDate),
            budgetEndDate: new Date(budget.endDate),
            budgetState: budget.state,
            spend: budget.spend,
            available: budget.available,
          },
        });
        savedCount++;
      }
      continue;
    }

    const reportId = `campaign-${campaign.id}`;
    await prisma.zemantaReport.upsert({
      where: { id: reportId },
      update: {
        providerJobId,
        userId,
        profileId: profileId || null,
        campaignId: campaign.id,
        budgetId: null,
        accountId: campaign.accountId,
        accountName: campaign.accountName,
        currency: campaign.currency,
        agencyName: campaign.agencyName,
        campaignManager: campaign.campaignManager,
        campaignName: campaign.name,
        archived: campaign.archived || false,
        iabCategory: campaign.iabCategory,
        frequencyCapping: campaign.frequencyCapping,
        deliveryStatus: campaign.deliveryStatus,
        totalCost: campaignWithStats.stats?.totalCost,
        impressions: campaignWithStats.stats?.impressions,
        clicks: campaignWithStats.stats?.clicks,
        cpc: campaignWithStats.stats?.cpc,
        statsFrom: from ? new Date(from) : null,
        statsTo: to ? new Date(to) : null,
        creditId: null,
        amount: null,
        margin: null,
        comment: null,
        budgetStartDate: null,
        budgetEndDate: null,
        budgetState: null,
        spend: null,
        available: null,
        updatedAt: new Date(),
      },
      create: {
        id: reportId,
        providerJobId,
        userId,
        profileId: profileId || null,
        campaignId: campaign.id,
        budgetId: null,
        accountId: campaign.accountId,
        accountName: campaign.accountName,
        currency: campaign.currency,
        agencyName: campaign.agencyName,
        campaignManager: campaign.campaignManager,
        campaignName: campaign.name,
        archived: campaign.archived || false,
        iabCategory: campaign.iabCategory,
        frequencyCapping: campaign.frequencyCapping,
        deliveryStatus: campaign.deliveryStatus,
        totalCost: campaignWithStats.stats?.totalCost,
        impressions: campaignWithStats.stats?.impressions,
        clicks: campaignWithStats.stats?.clicks,
        cpc: campaignWithStats.stats?.cpc,
        statsFrom: from ? new Date(from) : null,
        statsTo: to ? new Date(to) : null,
        creditId: null,
        amount: null,
        margin: null,
        comment: null,
        budgetStartDate: null,
        budgetEndDate: null,
        budgetState: null,
        spend: null,
        available: null,
      },
    });
    savedCount++;
  }

  return savedCount;
}

async function processJob(prisma: PrismaClient, jobId: string): Promise<void> {
  const job = await prisma.providerJob.findUnique({ where: { id: jobId } });

  if (!job) {
    console.log(`[zemanta-worker] Job ${jobId} not found, skipping`);
    return;
  }

  const claimResult = await prisma.providerJob.updateMany({
    where: { id: jobId, status: 0, provider: 'zemanta' },
    data: { status: 1 },
  });

  if (claimResult.count === 0) {
    console.log(`[zemanta-worker] Job ${jobId} already claimed, skipping`);
    return;
  }

  console.log(`[zemanta-worker] Job ${jobId} -> RUNNING`);

  try {
    const { accessToken, clientId, clientSecret, baseUrl } =
      await resolveCredentials(prisma, job.userId, job.profileId);

    const adapter = new ZemantaAdapter({
      clientId,
      clientSecret,
      baseUrl,
    });

    const from = job.fromDate.toISOString().split('T')[0];
    const to = job.toDate.toISOString().split('T')[0];
    const accountId = job.reportType || undefined;

    const campaigns = await adapter.listCampaignsWithStats(
      {
        accountId,
        includeBudgets: true,
        includeGoals: false,
        includeArchived: false,
        excludeInactive: false,
        includeDeliveryStatus: true,
      },
      from,
      to,
      accessToken,
    );

    const savedCount = await upsertZemantaReports(
      prisma,
      campaigns,
      from,
      to,
      job.id,
      job.userId,
      job.profileId,
    );

    await prisma.providerJob.updateMany({
      where: { id: jobId, status: 1 },
      data: {
        status: 2,
        completedAt: new Date(),
        rowsCount: savedCount,
      },
    });

    console.log(
      `[zemanta-worker] Job ${jobId} -> COMPLETED (${savedCount} rows saved)`,
    );
  } catch (err: any) {
    console.error(
      `[zemanta-worker] Job ${jobId} -> FAILED:`,
      err?.message || err,
    );

    await prisma.providerJob.updateMany({
      where: { id: jobId, status: 1 },
      data: {
        status: -1,
        completedAt: new Date(),
        errorMessage: err?.message || 'Unknown error',
      },
    });
  }
}

async function processPendingJobs(prisma: PrismaClient): Promise<void> {
  const pending = await prisma.providerJob.findMany({
    where: { status: 0, provider: 'zemanta' },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) return;

  console.log(
    `[zemanta-worker] Found ${pending.length} PENDING job(s), processing...`,
  );

  for (const job of pending) {
    await processJob(prisma, job.id);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPoller(prisma: PrismaClient): Promise<void> {
  const pollIntervalMs = Number(process.env.ZEMANTA_WORKER_POLL_MS || 1000);
  console.log(
    `[zemanta-worker] Poller started. Checking every ${pollIntervalMs}ms for status=0 jobs`,
  );

  while (true) {
    try {
      await processPendingJobs(prisma);
    } catch (err: any) {
      console.error(
        '[zemanta-worker] Poller iteration failed:',
        err?.message || err,
      );
    }

    await sleep(pollIntervalMs);
  }
}

async function main(): Promise<void> {
  const workerEnabled =
    (process.env.ZEMANTA_WORKER_ENABLED || '').toLowerCase() === 'true';

  if (!workerEnabled) {
    console.log(
      '[zemanta-worker] ZEMANTA_WORKER_ENABLED is not true. Worker will not process jobs.',
    );
    return;
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter } as any);

  try {
    const jobId = process.argv[2];
    if (jobId) {
      await processJob(prisma, jobId);
    } else {
      await runPoller(prisma);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[zemanta-worker] Fatal error:', err);
  process.exit(1);
});
