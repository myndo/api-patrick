import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginRTBHouseDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class FetchRTBHouseDataDto {
  @IsNotEmpty()
  @IsString()
  dayFrom: string;

  @IsNotEmpty()
  @IsString()
  dayTo: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;
}
