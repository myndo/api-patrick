import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadsDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  uploadableId: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  uploadType: string;
}

export class CreateOrUpdateloadsDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  uploadableId: string;

  @IsNotEmpty()
  @IsString()
  model: string;
}
