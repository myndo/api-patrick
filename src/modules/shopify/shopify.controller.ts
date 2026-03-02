import {
  Body,
  Controller,
  Post,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import { ShopifyService } from './shopify.service';
import {
  FetchShopifyProductsDto,
  FetchShopifyOrdersDto,
  FetchShopifyCustomersDto,
  FetchShopifyProductByIdDto,
  FetchShopifyOrderByIdDto,
  FetchShopifyShopInfoDto,
  SearchShopifyProductsDto,
  GetShopifyCountDto,
} from './shopify.dto';

@Controller('shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  private extractAccessToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(
        'Missing or invalid Authorization header. Use Bearer token format.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return authHeader.slice(7);
  }

  /**
   * Fetch all products from Shopify
   */
  @Post('/products')
  async fetchProducts(
    @Body() body: FetchShopifyProductsDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, limit } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.fetchProducts(
        shop,
        accessToken,
        limit || 50,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a single product by ID
   */
  @Post('/products/by-id')
  async fetchProductById(
    @Body() body: FetchShopifyProductByIdDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, productId } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.fetchProductById(
        shop,
        accessToken,
        productId,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch all orders from Shopify
   */
  @Post('/orders')
  async fetchOrders(
    @Body() body: FetchShopifyOrdersDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, status, limit } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.fetchOrders(
        shop,
        accessToken,
        status || 'any',
        limit || 50,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch a single order by ID
   */
  @Post('/orders/by-id')
  async fetchOrderById(
    @Body() body: FetchShopifyOrderByIdDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, orderId } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.fetchOrderById(
        shop,
        accessToken,
        orderId,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch all customers from Shopify
   */
  @Post('/customers')
  async fetchCustomers(
    @Body() body: FetchShopifyCustomersDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, limit } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.fetchCustomers(
        shop,
        accessToken,
        limit || 50,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch shop information
   */
  @Post('/shop-info')
  async fetchShopInfo(
    @Body() body: FetchShopifyShopInfoDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.fetchShopInfo(shop, accessToken);
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch shop info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search products by query
   */
  @Post('/products/search')
  async searchProducts(
    @Body() body: SearchShopifyProductsDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, query, limit } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.searchProducts(
        shop,
        accessToken,
        query,
        limit || 50,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get product count
   */
  @Post('/products/count')
  async getProductCount(
    @Body() body: FetchShopifyShopInfoDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.getProductCount(
        shop,
        accessToken,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get product count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get order count
   */
  @Post('/orders/count')
  async getOrderCount(
    @Body() body: GetShopifyCountDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop, status } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.getOrderCount(
        shop,
        accessToken,
        status || 'any',
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get order count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get customer count
   */
  @Post('/customers/count')
  async getCustomerCount(
    @Body() body: FetchShopifyShopInfoDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const { shop } = body;
      const accessToken = this.extractAccessToken(authHeader);
      const result = await this.shopifyService.getCustomerCount(
        shop,
        accessToken,
      );
      return reply({
        res: null,
        results: result,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get customer count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
