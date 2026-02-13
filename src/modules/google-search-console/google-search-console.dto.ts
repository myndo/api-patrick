import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class SearchAnalyticsDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsEnum(['query', 'page', 'country', 'device', 'searchAppearance'], {
    each: true,
  })
  dimensions?: ('query' | 'page' | 'country' | 'device' | 'searchAppearance')[];

  @IsOptional()
  @IsNumber()
  rowLimit?: number;

  @IsOptional()
  @IsNumber()
  startRow?: number;
}

export class TopQueriesDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class TopPagesDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class PerformanceByCountryDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}

export class PerformanceByDeviceDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}

export class TotalStatsDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;
}

export class ListSitesDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

export class ListSitemapsDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

export class SubmitSitemapDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  feedpath: string;
}

export class GetSitemapDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  feedpath: string;
}

export class DeleteSitemapDto {
  @IsNotEmpty()
  @IsString()
  siteUrl: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  feedpath: string;
}
