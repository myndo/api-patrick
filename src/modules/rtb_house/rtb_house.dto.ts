import { IsNotEmpty, IsString } from 'class-validator';

export class FetchRTBHouseDataDto {
  @IsNotEmpty()
  @IsString()
  dayFrom: string;

  @IsNotEmpty()
  @IsString()
  dayTo: string;

  @IsNotEmpty()
  @IsString()
  baseUrl: string;

  @IsNotEmpty()
  @IsString()
  advertiserId: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
