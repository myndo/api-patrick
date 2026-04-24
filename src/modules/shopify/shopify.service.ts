import { Injectable } from '@nestjs/common';
import { ShopifyServiceAdapter } from '../integrations/shopify-service-adapter';
//import shopifyApi, { ApiVersion, Session } from '@shopify/shopify-api';
@Injectable()
export class ShopifyService {
  private shopifyAdapter: ShopifyServiceAdapter;

  /* constructor() {
    const apiVersion =
      (process.env.SHOPIFY_API_VERSION as ApiVersion | undefined) ??
      DEFAULT_SHOPIFY_API_VERSION;

    // Initialize Shopify adapter with config from environment variables
    this.shopifyAdapter = new ShopifyServiceAdapter({
      apiKey: process.env.SHOPIFY_API_KEY || '',
      apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
      scopes: [
        'read_products',
        'write_products',
        'read_orders',
        'read_customers',
      ],
      hostName: process.env.SHOPIFY_HOST_NAME || 'localhost:8000',
      apiVersion,
      isEmbeddedApp: false,
    });
  } */

  /**
   * Fetch all products from Shopify
   */
  /*  async fetchProducts(shop: string, accessToken: string, limit: number = 50) {
    try {
      const products = await this.shopifyAdapter.fetchProducts(
        shop,
        accessToken,
        limit,
      );
      return {
        count: products.length,
        products,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Fetch a single product by ID
   */
  /*  async fetchProductById(shop: string, accessToken: string, productId: number) {
    try {
      const product = await this.shopifyAdapter.fetchProductById(
        shop,
        accessToken,
        productId,
      );
      return product;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Fetch all orders from Shopify
   */
  /* async fetchOrders(
    shop: string,
    accessToken: string,
    status: 'open' | 'closed' | 'cancelled' | 'any' = 'any',
    limit: number = 50,
  ) {
    try {
      const orders = await this.shopifyAdapter.fetchOrders(
        shop,
        accessToken,
        status,
        limit,
      );
      return {
        count: orders.length,
        orders,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Fetch a single order by ID
   */
  /*  async fetchOrderById(shop: string, accessToken: string, orderId: number) {
    try {
      const order = await this.shopifyAdapter.fetchOrderById(
        shop,
        accessToken,
        orderId,
      );
      return order;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Fetch all customers from Shopify
   */
  /* async fetchCustomers(shop: string, accessToken: string, limit: number = 50) {
    try {
      const customers = await this.shopifyAdapter.fetchCustomers(
        shop,
        accessToken,
        limit,
      );
      return {
        count: customers.length,
        customers,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch customers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Fetch shop information
   */
  /*  async fetchShopInfo(shop: string, accessToken: string) {
    try {
      const shopInfo = await this.shopifyAdapter.fetchShopInfo(
        shop,
        accessToken,
      );
      return shopInfo;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch shop info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Search products by query
   */
  /* async searchProducts(
    shop: string,
    accessToken: string,
    query: string,
    limit: number = 50,
  ) {
    try {
      const products = await this.shopifyAdapter.searchProducts(
        shop,
        accessToken,
        query,
        limit,
      );
      return {
        count: products.length,
        products,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Get product count
   */
  /*  async getProductCount(shop: string, accessToken: string) {
    try {
      const count = await this.shopifyAdapter.getProductCount(
        shop,
        accessToken,
      );
      return { count };
    } catch (error) {
      throw new HttpException(
        `Failed to get product count: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Get order count
   */
  /*  async getOrderCount(
    shop: string,
    accessToken: string,
    status: 'open' | 'closed' | 'cancelled' | 'any' = 'any',
  ) {
    try {
      const count = await this.shopifyAdapter.getOrderCount(
        shop,
        accessToken,
        status,
      );
      return { count };
    } catch (error) {
      throw new HttpException(
        `Failed to get order count: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */

  /**
   * Get customer count
   */
  /* async getCustomerCount(shop: string, accessToken: string) {
    try {
      const count = await this.shopifyAdapter.getCustomerCount(
        shop,
        accessToken,
      );
      return { count };
    } catch (error) {
      throw new HttpException(
        `Failed to get customer count: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */
}
