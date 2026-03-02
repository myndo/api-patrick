-- CreateTable
CREATE TABLE "User" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" TEXT,
    "organizationId" TEXT,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "description" TEXT,
    "testimonial" TEXT,
    "city" TEXT,
    "currencyId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3),
    "campaign" TEXT,
    "investment" DOUBLE PRECISION,
    "status" TEXT,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "conversionsCount" INTEGER NOT NULL DEFAULT 0,
    "clientName" TEXT,
    "conversionsValue" DOUBLE PRECISION DEFAULT 0,
    "country" TEXT,
    "currency" TEXT,
    "impsCount" INTEGER NOT NULL DEFAULT 0,
    "campaignCost" DOUBLE PRECISION DEFAULT 0,
    "userSegment" TEXT,
    "provider" TEXT,
    "providerJobId" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopQuery" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopPage" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceByCountry" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceByCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceByDevice" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceByDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZemantaCampaign" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT,
    "currency" TEXT,
    "agencyName" TEXT,
    "campaignManager" TEXT,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "iabCategory" TEXT,
    "frequencyCapping" INTEGER,
    "deliveryStatus" TEXT,
    "totalCost" TEXT,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "cpc" TEXT,
    "statsFrom" TIMESTAMP(3),
    "statsTo" TIMESTAMP(3),

    CONSTRAINT "ZemantaCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZemantaCampaignBudget" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "margin" TEXT,
    "comment" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "spend" TEXT NOT NULL,
    "available" TEXT NOT NULL,

    CONSTRAINT "ZemantaCampaignBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeDoublerReport" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "campaignName" TEXT NOT NULL,
    "status" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "conversionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "country" TEXT,
    "currency" TEXT,

    CONSTRAINT "TradeDoublerReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "TopQuery_siteUrl_startDate_endDate_idx" ON "TopQuery"("siteUrl", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "TopQuery_query_idx" ON "TopQuery"("query");

-- CreateIndex
CREATE INDEX "TopPage_siteUrl_startDate_endDate_idx" ON "TopPage"("siteUrl", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "TopPage_page_idx" ON "TopPage"("page");

-- CreateIndex
CREATE INDEX "PerformanceByCountry_siteUrl_startDate_endDate_idx" ON "PerformanceByCountry"("siteUrl", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "PerformanceByCountry_country_idx" ON "PerformanceByCountry"("country");

-- CreateIndex
CREATE INDEX "PerformanceByDevice_siteUrl_startDate_endDate_idx" ON "PerformanceByDevice"("siteUrl", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "PerformanceByDevice_device_idx" ON "PerformanceByDevice"("device");

-- CreateIndex
CREATE INDEX "ZemantaCampaign_accountId_idx" ON "ZemantaCampaign"("accountId");

-- CreateIndex
CREATE INDEX "ZemantaCampaign_archived_idx" ON "ZemantaCampaign"("archived");

-- CreateIndex
CREATE INDEX "ZemantaCampaign_statsFrom_statsTo_idx" ON "ZemantaCampaign"("statsFrom", "statsTo");

-- CreateIndex
CREATE INDEX "ZemantaCampaignBudget_campaignId_idx" ON "ZemantaCampaignBudget"("campaignId");

-- CreateIndex
CREATE INDEX "ZemantaCampaignBudget_state_idx" ON "ZemantaCampaignBudget"("state");

-- CreateIndex
CREATE INDEX "ZemantaCampaignBudget_startDate_endDate_idx" ON "ZemantaCampaignBudget"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "TradeDoublerReport_date_idx" ON "TradeDoublerReport"("date");

-- CreateIndex
CREATE INDEX "TradeDoublerReport_campaignId_idx" ON "TradeDoublerReport"("campaignId");

-- CreateIndex
CREATE INDEX "TradeDoublerReport_country_idx" ON "TradeDoublerReport"("country");

-- CreateIndex
CREATE UNIQUE INDEX "TradeDoublerReport_date_campaignId_country_key" ON "TradeDoublerReport"("date", "campaignId", "country");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZemantaCampaignBudget" ADD CONSTRAINT "ZemantaCampaignBudget_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ZemantaCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
