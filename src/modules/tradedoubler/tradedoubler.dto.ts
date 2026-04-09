import { IsNotEmpty, IsString } from 'class-validator';

export class LoginTradeDoublerDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  secret: string;
}

export class FetchTradeDoublerDataDto {
  @IsNotEmpty()
  @IsString()
  dateFrom: string;

  @IsNotEmpty()
  @IsString()
  dateTo: string;

  /** Required to save reports per specific user */
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class CreateTradeDoublerJobDto {
  @IsNotEmpty()
  @IsString()
  fromDate: string;

  @IsNotEmpty()
  @IsString()
  toDate: string;

  @IsNotEmpty()
  @IsString()
  reportCurrencyCode: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsString()
  reportType?: string;

  @IsString()
  intervalType?: string;
}
