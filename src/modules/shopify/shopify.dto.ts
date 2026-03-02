import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class FetchShopifyProductsDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FetchShopifyOrdersDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsOptional()
  @IsEnum(['open', 'closed', 'cancelled', 'any'])
  status?: 'open' | 'closed' | 'cancelled' | 'any';

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FetchShopifyCustomersDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FetchShopifyProductByIdDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}

export class FetchShopifyOrderByIdDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}

export class FetchShopifyShopInfoDto {
  @IsNotEmpty()
  @IsString()
  shop: string;
}

export class SearchShopifyProductsDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsNotEmpty()
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class GetShopifyCountDto {
  @IsNotEmpty()
  @IsString()
  shop: string;

  @IsOptional()
  @IsEnum(['open', 'closed', 'cancelled', 'any'])
  status?: 'open' | 'closed' | 'cancelled' | 'any';
}
