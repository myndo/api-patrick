import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

export class TargetingDto {
  @IsOptional()
  @IsObject()
  publisherGroups?: {
    included?: string[];
    excluded?: string[];
  };

  @IsOptional()
  @IsObject()
  keywordLists?: {
    excluded?: string[];
  };
}

export class UpdateAccountDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @IsObject()
  targeting?: TargetingDto;

  @IsOptional()
  @IsNumber()
  frequencyCapping?: number;

  @IsOptional()
  @IsString()
  defaultIconUrl?: string;

  @IsOptional()
  @IsString()
  defaultBrandName?: string;
}

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsString()
  agencyId: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @IsObject()
  targeting?: TargetingDto;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  frequencyCapping?: number;

  @IsOptional()
  @IsString()
  defaultIconUrl?: string;

  @IsOptional()
  @IsString()
  defaultBrandName?: string;

  @IsOptional()
  @IsString()
  inventoryAccessLevel?: string;
}

export class GetAccountSourcesDto {
  @IsString()
  accountId: string;
}

export class GetAccountCreditsDto {
  @IsString()
  accountId: string;
}

export class GetAccountCreditDetailsDto {
  @IsString()
  accountId: string;

  @IsString()
  creditId: string;
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
