export type GetShopifyProductsSelections = {
  search?: string;
  shop?: string;
};

export type GetOneShopifyProductSelections = {
  productId?: string;
  shopifyProductId?: string;
};

export type UpdateShopifyProductSelections = {
  productId: string;
};

export const ShopifyProductSelect = {
  createdAt: true,
  updatedAt: true,
  id: true,
  shopifyProductId: true,
  title: true,
  description: true,
  vendor: true,
  productType: true,
  handle: true,
  status: true,
  tags: true,
  shop: true,
  price: true,
  currency: true,
};
