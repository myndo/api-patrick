import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baseUrl?: string;

  /** If provided, the resulting token will be persisted for this user */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;
}

export class ListAccountsDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeliveryStatus?: boolean = false;
}

export class GetAccountDetailsDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeliveryStatus?: boolean = false;
}

export class ListCampaignsDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeGoals?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeBudgets?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeliveryStatus?: boolean = false;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  excludeInactive?: boolean = false;

  @IsOptional()
  @IsString()
  from?: string; // YYYY-MM-DD format - if provided with 'to', includes stats for each campaign

  @IsOptional()
  @IsString()
  to?: string; // YYYY-MM-DD format - if provided with 'from', includes stats for each campaign
}

export class GetCampaignStatsDto {
  @IsString()
  campaignId: string;

  @IsString()
  from: string; // YYYY-MM-DD format

  @IsString()
  to: string; // YYYY-MM-DD format
}
