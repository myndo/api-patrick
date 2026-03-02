import { IsNotEmpty, IsString } from 'class-validator';

export class FetchTradeDoublerDataDto {
  @IsNotEmpty()
  @IsString()
  dateFrom: string;

  @IsNotEmpty()
  @IsString()
  dateTo: string;
}
