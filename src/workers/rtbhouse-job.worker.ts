/**
 * RTB House Job Worker
 */

// Load .env file when running as a standalone process
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { RTBHouseServiceAdapter } from '../modules/integrations/rtbhouse-service-adapter';
import { decrypt } from '../modules/integrations/token-encryption';

type RtbCredentials = {
  username: string;
  password: string;
};

async function resolveCredentials(
  prisma: PrismaClient,
  userId: string,
  profileId?: string | null,
): Promise<RtbCredentials> {
  const record = profileId
    ? await prisma.integrationToken.findUnique({
        where: {
          profileId_provider: { profileId, provider: 'rtbhouse' },
        },
      })
    : await prisma.integrationToken.findFirst({
        where: { userId, provider: 'rtbhouse' },
        orderBy: { updatedAt: 'desc' },
      });

  if (!record) {
    throw new Error(
      `No RTB House credentials stored for userId=${userId}. Login via /rtbhouse/users/register first.`,
    );
  }

  const metadata: Record<string, string> = record.metadata
    ? JSON.parse(decrypt(record.metadata))
    : {};

  const username = metadata.username;
  const password = metadata.password;

  if (!username || !password) {
    throw new Error(
      `Stored RTB House credentials are incomplete for userId=${userId}. Please login again.`,
    );
  }

  return { username, password };
}

async function processJob(prisma: PrismaClient, jobId: string): Promise<void> {
  const job = await prisma.providerJob.findUnique({ where: { id: jobId } });

  if (!job) {
    console.log(`[rtb-worker] Job ${jobId} not found, skipping`);
    return;
  }

  const claimResult = await prisma.providerJob.updateMany({
    where: { id: jobId, status: 0, provider: 'rtbhouse' },
    data: { status: 1 },
  });

  if (claimResult.count === 0) {
    console.log(`[rtb-worker] Job ${jobId} already claimed, skipping`);
    return;
  }

  console.log(`[rtb-worker] Job ${jobId} -> RUNNING`);

  try {
    const { username, password } = await resolveCredentials(
      prisma,
      job.userId,
      job.profileId,
    );

    const advertiserId = job.reportType;
    if (!advertiserId) {
      throw new Error(
        `Missing advertiserId for RTB House job ${jobId}. It should be stored in providerJob.reportType.`,
      );
    }

    const adapter = new RTBHouseServiceAdapter({
      baseUrl:
        process.env.RTBHOUSE_BASE_URL || 'https://api.panel.rtbhouse.com/v5',
      advertiserId,
      username,
      password,
    });

    const dayFrom = job.fromDate.toISOString().split('T')[0];
    const dayTo = job.toDate.toISOString().split('T')[0];

    const mergedData = await adapter.fetchAndMergeMetrics(dayFrom, dayTo);

    let savedCount = 0;

    for (const data of mergedData) {
      const latestJob = await prisma.providerJob.findUnique({
        where: { id: jobId },
        select: { status: true },
      });

      if (!latestJob || latestJob.status !== 1) {
        console.log(
          `[rtb-worker] Job ${jobId} status changed to ${latestJob?.status ?? 'N/A'}, stopping save loop`,
        );
        break;
      }

      const existing = await prisma.rTBHouseReport.findFirst({
        where: {
          providerJobId: job.id,
          day: new Date(data.day),
          campaign: data.campaign,
          country: data.country,
          userSegment: data.userSegment,
        },
      });

      if (!existing) {
        await prisma.rTBHouseReport.create({
          data: {
            userId: job.userId,
            profileId: job.profileId || null,
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
            providerJobId: job.id,
          },
        });
        savedCount++;
      }
    }

    const completeResult = await prisma.providerJob.updateMany({
      where: { id: jobId, status: 1 },
      data: {
        status: 2,
        completedAt: new Date(),
        rowsCount: savedCount,
      },
    });

    if (completeResult.count === 0) {
      console.log(
        `[rtb-worker] Job ${jobId} completion skipped because status changed externally`,
      );
      return;
    }

    console.log(
      `[rtb-worker] Job ${jobId} -> COMPLETED (${savedCount} rows saved)`,
    );
  } catch (err: any) {
    console.error(`[rtb-worker] Job ${jobId} -> FAILED:`, err?.message || err);

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
    where: { status: 0, provider: 'rtbhouse' },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) return;

  console.log(
    `[rtb-worker] Found ${pending.length} PENDING job(s), processing...`,
  );

  for (const job of pending) {
    await processJob(prisma, job.id);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPoller(prisma: PrismaClient): Promise<void> {
  const pollIntervalMs = Number(process.env.RTB_WORKER_POLL_MS || 1000);
  console.log(
    `[rtb-worker] Poller started. Checking every ${pollIntervalMs}ms for status=0 jobs`,
  );

  while (true) {
    try {
      await processPendingJobs(prisma);
    } catch (err: any) {
      console.error(
        '[rtb-worker] Poller iteration failed:',
        err?.message || err,
      );
    }

    await sleep(pollIntervalMs);
  }
}

async function main(): Promise<void> {
  const workerEnabled =
    (process.env.RTB_WORKER_ENABLED || '').toLowerCase() === 'true';

  if (!workerEnabled) {
    console.log(
      '[rtb-worker] RTB_WORKER_ENABLED is not true. Worker will not process jobs.',
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
  console.error('[rtb-worker] Fatal error:', err);
  process.exit(1);
});
