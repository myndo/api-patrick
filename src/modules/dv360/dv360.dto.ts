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
}

export class ListDv360PartnersDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize?: number = 100;
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
}
