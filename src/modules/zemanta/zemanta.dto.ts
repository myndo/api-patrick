import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateZemantaJobDto {
  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @IsString()
  @IsNotEmpty()
  toDate: string;

  @IsString()
  @IsNotEmpty()
  profileId: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
