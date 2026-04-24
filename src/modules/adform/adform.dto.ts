import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  Matches,
} from 'class-validator';

export class FetchAdformStatsDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom must be YYYY-MM-DD' })
  dateFrom: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo must be YYYY-MM-DD' })
  dateTo: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dimensions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  campaignIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  advertiserIds?: number[];
}
