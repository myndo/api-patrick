import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

export interface ShopifyConfig {
  apiKey: string;
  apiSecretKey: string;
  scopes: string[];
  hostName: string;
  apiVersion?: ApiVersion;
  isEmbeddedApp?: boolean;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: string;
  admin_graphql_api_id: string;
  variants: any[];
  options: any[];
  images: any[];
  image: any;
}

export interface ShopifyOrder {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string | null;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  buyer_accepts_marketing: boolean;
  name: string;
  referring_site: string;
  landing_site: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
  reference: string;
  user_id: number | null;
  location_id: number | null;
  source_identifier: string;
  source_url: string | null;
  device_id: number | null;
  phone: string | null;
  customer_locale: string;
  app_id: number;
  browser_ip: string;
  landing_site_ref: string | null;
  order_number: number;
  line_items: any[];
  shipping_lines: any[];
  billing_address: any;
  shipping_address: any;
  customer: any;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number | null;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  tags: string;
  last_order_name: string | null;
  currency: string;
  addresses: any[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  admin_graphql_api_id: string;
}

export class ShopifyServiceAdapter {
  private shopify: ReturnType<typeof shopifyApi>;
  private config: ShopifyConfig;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.shopify = shopifyApi({
      apiKey: config.apiKey,
      apiSecretKey: config.apiSecretKey,
      scopes: config.scopes,
      hostName: config.hostName,
      apiVersion: config.apiVersion,
      isEmbeddedApp: config.isEmbeddedApp || false,
    });
  }

  /**
   * Create a REST client with the provided session
   */
  private async createRestClient(shop: string, accessToken: string) {
    const session = new Session({
      id: `offline_${shop}`,
      shop,
      state: 'online',
      isOnline: false,
      accessToken,
    });

    return new this.shopify.clients.Rest({ session });
  }

  /**
   * Fetch all products from Shopify store
   */
  async fetchProducts(
    shop: string,
    accessToken: string,
    limit: number = 50,
  ): Promise<ShopifyProduct[]> {
    try {
      const client = await this.createRestClient(shop, accessToken);

      const response = await client.get({
        path: 'products',
        query: { limit: limit.toString() },
      });

      return response.body.products as ShopifyProduct[];
    } catch (error) {
      console.error('Shopify API Error Details:');
      throw error;
    }
  }

  /**
   * Fetch a single product by ID
   */
  async fetchProductById(
    shop: string,
    accessToken: string,
    productId: number,
  ): Promise<ShopifyProduct> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: `products/${productId}`,
    });

    return response.body.product as ShopifyProduct;
  }

  /**
   * Fetch all orders from Shopify store
   */
  async fetchOrders(
    shop: string,
    accessToken: string,
    status: 'open' | 'closed' | 'cancelled' | 'any' = 'any',
    limit: number = 50,
  ): Promise<ShopifyOrder[]> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'orders',
      query: {
        status,
        limit: limit.toString(),
      },
    });

    return response.body.orders as ShopifyOrder[];
  }

  /**
   * Fetch a single order by ID
   */
  async fetchOrderById(
    shop: string,
    accessToken: string,
    orderId: number,
  ): Promise<ShopifyOrder> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: `orders/${orderId}`,
    });

    return response.body.order as ShopifyOrder;
  }

  /**
   * Fetch all customers from Shopify store
   */
  async fetchCustomers(
    shop: string,
    accessToken: string,
    limit: number = 50,
  ): Promise<ShopifyCustomer[]> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'customers',
      query: { limit: limit.toString() },
    });

    return response.body.customers as ShopifyCustomer[];
  }

  /**
   * Fetch a single customer by ID
   */
  async fetchCustomerById(
    shop: string,
    accessToken: string,
    customerId: number,
  ): Promise<ShopifyCustomer> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: `customers/${customerId}`,
    });

    return response.body.customer as ShopifyCustomer;
  }

  /**
   * Create a new product
   */
  async createProduct(
    shop: string,
    accessToken: string,
    productData: Partial<ShopifyProduct>,
  ): Promise<ShopifyProduct> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.post({
      path: 'products',
      data: { product: productData },
    });

    return response.body.product as ShopifyProduct;
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    shop: string,
    accessToken: string,
    productId: number,
    productData: Partial<ShopifyProduct>,
  ): Promise<ShopifyProduct> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.put({
      path: `products/${productId}`,
      data: { product: productData },
    });

    return response.body.product as ShopifyProduct;
  }

  /**
   * Delete a product
   */
  async deleteProduct(
    shop: string,
    accessToken: string,
    productId: number,
  ): Promise<void> {
    const client = await this.createRestClient(shop, accessToken);

    await client.delete({
      path: `products/${productId}`,
    });
  }

  /**
   * Fetch shop information
   */
  async fetchShopInfo(shop: string, accessToken: string): Promise<any> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'shop',
    });

    return response.body.shop;
  }

  /**
   * Search products by query
   */
  async searchProducts(
    shop: string,
    accessToken: string,
    query: string,
    limit: number = 50,
  ): Promise<ShopifyProduct[]> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'products',
      query: {
        limit: limit.toString(),
        title: query,
      },
    });

    return response.body.products as ShopifyProduct[];
  }

  /**
   * Get product count
   */
  async getProductCount(shop: string, accessToken: string): Promise<number> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'products/count',
    });

    return response.body.count as number;
  }

  /**
   * Get order count
   */
  async getOrderCount(
    shop: string,
    accessToken: string,
    status: 'open' | 'closed' | 'cancelled' | 'any' = 'any',
  ): Promise<number> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'orders/count',
      query: { status },
    });

    return response.body.count as number;
  }

  /**
   * Get customer count
   */
  async getCustomerCount(shop: string, accessToken: string): Promise<number> {
    const client = await this.createRestClient(shop, accessToken);

    const response = await client.get({
      path: 'customers/count',
    });

    return response.body.count as number;
  }
}
