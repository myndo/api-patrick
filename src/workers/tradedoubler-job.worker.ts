/**
 * TradeDoubler Job Worker
 */

// Load .env file when running as a standalone process
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

import axios from 'axios';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { TradeDoublerServiceAdapter } from '../modules/integrations/tradedoubler-service-adapter';
import { decrypt, encrypt } from '../modules/integrations/token-encryption';

async function resolveToken(
  prisma: PrismaClient,
  userId: string,
  profileId?: string | null,
  accessTokenFromEnv?: string,
): Promise<string> {
  if (accessTokenFromEnv?.trim()) {
    return accessTokenFromEnv.trim();
  }

  const record = profileId
    ? await prisma.integrationToken.findUnique({
        where: {
          profileId_provider: { profileId, provider: 'tradedoubler' },
        },
      })
    : await prisma.integrationToken.findFirst({
        where: { userId, provider: 'tradedoubler' },
        orderBy: { updatedAt: 'desc' },
      });

  if (!record) {
    throw new Error(
      `No TradeDoubler token stored for userId=${userId}. ` +
        `Login via /trade_doubler/users/register first.`,
    );
  }

  const isExpired = record.expiresAt ? new Date() >= record.expiresAt : false;

  if (!isExpired) {
    return decrypt(record.accessToken);
  }

  // Token is expired — attempt refresh.
  console.log(
    `[td-worker] Access token expired for userId=${userId}, refreshing…`,
  );

  if (!record.refreshToken) {
    throw new Error(
      `Access token expired for userId=${userId} and no refresh token is stored. ` +
        `Please re-authenticate via /trade_doubler/users/register.`,
    );
  }

  const refreshToken = decrypt(record.refreshToken);
  const metadata: Record<string, string> = record.metadata
    ? JSON.parse(decrypt(record.metadata))
    : {};

  const clientId = metadata.clientId || process.env.TRADEDOUBLER_CLIENT_ID;
  const secret = metadata.secret || process.env.TRADEDOUBLER_SECRET;

  if (!clientId || !secret) {
    throw new Error(
      `Missing TradeDoubler client credentials for refresh (userId=${userId}). ` +
        `Please re-authenticate.`,
    );
  }

  const encoded = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await axios.post(
    'https://connect.tradedoubler.com/uaa/oauth/token',
    params.toString(),
    {
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    },
  );

  const newAccessToken: string = response.data.access_token;
  const newRefreshToken: string = response.data.refresh_token ?? refreshToken;
  const expiresIn = Number(response.data.expires_in);
  const expiresAt = Number.isFinite(expiresIn)
    ? new Date(Date.now() + expiresIn * 1000)
    : null;

  // Persist refreshed tokens so future jobs and API calls benefit.
  await prisma.integrationToken.update({
    where: { id: record.id },
    data: {
      accessToken: encrypt(newAccessToken),
      refreshToken: encrypt(newRefreshToken),
      expiresAt: expiresAt,
    },
  });

  console.log(`[td-worker] Token refreshed successfully for userId=${userId}.`);

  return newAccessToken;
}

async function processJob(
  prisma: PrismaClient,
  jobId: string,
  accessTokenFromEnv?: string,
): Promise<void> {
  const job = await prisma.providerJob.findUnique({ where: { id: jobId } });

  if (!job) {
    console.log(`[td-worker] Job ${jobId} not found, skipping`);
    return;
  }

  // Atomically claim the job. Only one worker can move 0 -> 1.
  const claimed = await prisma.providerJob.update({
    where: { id: jobId, status: 0 },
    data: { status: 1 },
  });

  if (!claimed) {
    console.log(
      `[td-worker] Job ${jobId} was already claimed by another worker, skipping`,
    );
    return;
  }

  console.log(`[td-worker] Job ${jobId} → RUNNING`);

  try {
    const resolvedAccessToken = await resolveToken(
      prisma,
      job.userId,
      job.profileId,
      accessTokenFromEnv,
    );

    const tokenRecord = job.profileId
      ? await prisma.integrationToken.findUnique({
          where: {
            profileId_provider: {
              profileId: job.profileId,
              provider: 'tradedoubler',
            },
          },
        })
      : await prisma.integrationToken.findFirst({
          where: { userId: job.userId, provider: 'tradedoubler' },
          orderBy: { updatedAt: 'desc' },
        });

    const metadataStr = tokenRecord?.metadata
      ? decrypt(tokenRecord.metadata)
      : '{}';
    const metadata = JSON.parse(metadataStr) as Record<string, string>;

    const adapter = new TradeDoublerServiceAdapter({
      accessToken: resolvedAccessToken,
      organizationId:
        metadata.organizationId || process.env.TRADEDOUBLER_ORGANIZATION_ID,
      baseUrl:
        process.env.TRADEDOUBLER_BASE_URL || 'https://connect.tradedoubler.com',
    });

    const fromDate = job.fromDate.toISOString().split('T')[0];
    const toDate = job.toDate.toISOString().split('T')[0];

    // Refresh token right before API calls to ensure it hasn't expired
    const freshAccessToken = await resolveToken(
      prisma,
      job.userId,
      job.profileId,
      accessTokenFromEnv,
    );
    adapter.setAccessToken(freshAccessToken);

    const mergedData = await adapter.fetchStatisticsAndTransactions(
      fromDate,
      toDate,
      job.reportCurrencyCode || 'EUR',
      job.reportType || undefined,
      job.intervalType || undefined,
    );

    let savedCount = 0;

    for (const data of mergedData) {
      const existing = await prisma.tradeDoublerReport.findFirst({
        where: {
          userId: job.userId,
          jobId: job.id,
          date: new Date(data.date),
          organizationId: data.organizationId,
          programId: data.programId,
          country: data.country,
        },
      });

      if (!existing) {
        await prisma.tradeDoublerReport.create({
          data: {
            user: { connect: { id: job.userId } },
            job: { connect: { id: job.id } },
            profileId: job.profileId || null,
            date: new Date(data.date),
            organizationName: data.organizationName,
            organizationId: data.organizationId,
            campaignName: data.campaignName,
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
          },
        });
        savedCount++;
      }
    }

    await prisma.providerJob.update({
      where: { id: jobId },
      data: {
        status: 2,
        completedAt: new Date(),
        rowsCount: savedCount,
      },
    });

    console.log(
      `[td-worker] Job ${jobId} → COMPLETED (${savedCount} rows saved)`,
    );
  } catch (err: any) {
    console.error(`[td-worker] Job ${jobId} → FAILED:`, err.message);

    await prisma.providerJob.update({
      where: { id: jobId },
      data: {
        status: -1,
        completedAt: new Date(),
        errorMessage: err.message || 'Unknown error',
      },
    });
  }
}

async function processPendingJobs(prisma: PrismaClient): Promise<void> {
  const pending = await prisma.providerJob.findMany({
    where: { status: 0, provider: 'tradedoubler' },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) return;

  console.log(
    `[td-worker] Found ${pending.length} PENDING job(s), processing…`,
  );

  for (const job of pending) {
    await processJob(prisma, job.id);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPoller(prisma: PrismaClient): Promise<void> {
  const pollIntervalMs = Number(process.env.TD_WORKER_POLL_MS || 1000);
  console.log(
    `[td-worker] Poller started. Checking every ${pollIntervalMs}ms for status=0 jobs`,
  );

  while (true) {
    try {
      await processPendingJobs(prisma);
    } catch (err: any) {
      console.error(
        '[td-worker] Poller iteration failed:',
        err?.message || err,
      );
    }

    await sleep(pollIntervalMs);
  }
}

async function main(): Promise<void> {
  const workerEnabled =
    (process.env.TD_WORKER_ENABLED || '').toLowerCase() === 'true';

  if (!workerEnabled) {
    console.log(
      '[td-worker] TD_WORKER_ENABLED is not true. Worker will not process jobs.',
    );
    return;
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  // PrismaClient accepts adapter in constructor options (Prisma 7, driver adapters GA)
  const prisma = new PrismaClient({ adapter } as any);

  try {
    const jobId = process.argv[2];
    const accessTokenFromEnv = process.env.TRADEDOUBLER_ACCESS_TOKEN;
    if (jobId) {
      await processJob(prisma, jobId, accessTokenFromEnv);
    } else {
      await runPoller(prisma);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[td-worker] Fatal error:', err);
  process.exit(1);
});
