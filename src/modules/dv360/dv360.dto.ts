import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ExchangeDv360CodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  redirectUri?: string;

  /** If provided, the resulting tokens will be persisted for this user */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;
}

export class ListDv360PartnersDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize?: number = 100;

  /** If provided and no Authorization header, tokens are loaded from DB */
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ListDv360AdvertisersDto {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize?: number = 100;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class ListDv360CampaignsDto {
  @IsString()
  @IsNotEmpty()
  advertiserId: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize?: number = 100;

  @IsOptional()
  @IsString()
  userId?: string;
}
