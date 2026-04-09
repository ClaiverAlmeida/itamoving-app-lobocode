/** UI model for a delivery price row (list / forms). */
export interface DeliveryPrice {
  id: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pricePerKg: number;
  minimumPrice: number;
  deliveryDeadline: number;
  active: boolean;
}

/** UI model for a product price row (list / forms). */
export interface ProductPrice {
  id: string;
  type: "SMALL_BOX" | "MEDIUM_BOX" | "LARGE_BOX" | "PERSONALIZED_ITEM" | "TAPE_ADHESIVE";
  name: string;
  size?: string;
  dimensions?: string | null;
  maxWeight?: number | null;
  costPrice: number;
  salePrice: number;
  active: boolean;
  variablePrice?: boolean;
}

export interface CreateProductPriceDTO {
  id?: string;
  type: 'SMALL_BOX' | 'MEDIUM_BOX' | 'LARGE_BOX' | 'PERSONALIZED_ITEM' | 'TAPE_ADHESIVE';
  name: string;
  dimensions?: string | null;
  maxWeight?: number | null;
  costPrice: number;
  salePrice: number;
  active: boolean;
  variablePrice: boolean;
}

export interface ProductPriceBackend {
  id: string;
  companyId: string;
  type: 'SMALL_BOX' | 'MEDIUM_BOX' | 'LARGE_BOX' | 'PERSONALIZED_ITEM' | 'TAPE_ADHESIVE';
  name: string;
  dimensions?: string;
  maxWeight?: number;
  costPrice: number;
  salePrice: number;
  active: boolean;
  variablePrice: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPricePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateDeliveryPriceDTO {
  id?: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pricePerKg: number;
  minimumPrice: number;
  deliveryDeadline: number;
  active: boolean;
}

export interface DeliveryPriceBackend {
  id: string;
  companyId: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pricePerKg: number;
  minimumPrice: number;
  deliveryDeadline: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPricesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
