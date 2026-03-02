import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class FetchRTBHouseDataDto {
  @IsNotEmpty()
  @IsString()
  dayFrom: string;

  @IsNotEmpty()
  @IsString()
  dayTo: string;

  @IsOptional()
  @IsString()
  advertiserId?: string;
}
