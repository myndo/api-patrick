import { IsNotEmpty, IsString } from 'class-validator';

export class LoginTradeDoublerDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
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
  profileId: string;

  @IsString()
  reportType?: string;

  @IsString()
  intervalType?: string;
}
