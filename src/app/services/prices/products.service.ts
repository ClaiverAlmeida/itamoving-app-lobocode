import { api } from "../api.service";
import { PrecoProduto } from "../../types";

export interface CreateProductPriceDTO {
  id?: string;
  type: "SMALL_BOX" | "MEDIUM_BOX" | "LARGE_BOX" | "PERSONALIZED_ITEM" | "TAPE_ADHESIVE";
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
  type: "SMALL_BOX" | "MEDIUM_BOX" | "LARGE_BOX" | "PERSONALIZED_ITEM" | "TAPE_ADHESIVE";
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

export type UpdateProductPriceDTO = Partial<CreateProductPriceDTO>;

export interface ProductPricePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function mapBackendToFrontend(product: ProductPriceBackend): PrecoProduto {
  return {
    id: product.id,
    type: product.type,
    name: product.name,
    dimensions: product.dimensions,
    maxWeight: product.maxWeight,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    active: product.active,
    variablePrice: product.variablePrice,
  };
}

export class ProductsService {
  async getAll(
    page = 1,
    limit = 10,
  ): Promise<{
    success: boolean;
    data?: PrecoProduto[];
    pagination?: ProductPricePagination;
    error?: string;
  }> {
    try {
      const result = await api.get<{
        data: ProductPriceBackend[];
        pagination: ProductPricePagination;
      }>(`/product-prices/?page=${page}&limit=${limit}`);
      if (result.success && result.data) {
        const raw = result.data as any;
        const dataArray: ProductPriceBackend[] = Array.isArray(raw?.data)
          ? raw.data
          : [];
        const pagination = raw?.pagination as
          | ProductPricePagination
          | undefined;

        const productsMapeados = dataArray.map(mapBackendToFrontend);
        return {
          success: true,
          data: productsMapeados,
          ...(pagination && { pagination }),
        };
      }
      return {
        success: false,
        error: result.error || "Erro ao buscar produtos",
      };
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return {
        success: false,
        error: "Erro ao buscar produtos",
      };
    }
  }

  async create(
    data: CreateProductPriceDTO,
  ): Promise<{ success: boolean; data?: PrecoProduto; error?: string }> {
    try {
      const result = await api.post<ProductPriceBackend>(
        "/product-prices",
        data,
      );
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const productPriceBackend = raw as ProductPriceBackend;
        const productPrice = mapBackendToFrontend(productPriceBackend);
        return { success: true, data: productPrice };
      } else {
        return { success: false, error: "Erro ao criar produto" };
      }
    } catch (error) {
      return { success: false, error: "Erro ao criar produto" };
    }
  }

  async update(
    id: string,
    data: UpdateProductPriceDTO,
  ): Promise<{ success: boolean; data?: PrecoProduto; error?: string }> {
    try {
      const result = await api.patch<
        ProductPriceBackend | { data: ProductPriceBackend }
      >(`/product-prices/${id}`, data);

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const productPriceBackend = raw as ProductPriceBackend;
        const productPrice = mapBackendToFrontend(productPriceBackend);
        return { success: true, data: productPrice };
      }

      return { success: false, error: "Erro ao atualizar produto" };
    } catch (error) {
      return { success: false, error: "Erro ao atualizar produto" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete<{ data: PrecoProduto }>(
        `/product-prices/${id}`,
      );

      if (result.success && result.data) {
        return { success: true };
      }

      return { success: false, error: "Erro ao deletar produto" };
    } catch (error) {
      return { success: false, error: "Erro ao deletar produto" };
    }
  }

  async export(): Promise<{ success: boolean; data?: PrecoProduto[]; error?: string }> {
    try {
      const result = await api.get<{ data: ProductPriceBackend }>("/product-prices/");

      if (result.success && result.data) {
        const raw = result.data as any;
        const dataArray: ProductPriceBackend[] = Array.isArray(raw?.data)
        ? raw.data
        : [];
        const productsMapeados = dataArray.map(mapBackendToFrontend);
        return { success: true, data: productsMapeados };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: "Erro ao exportar produtos" };
    }
  }
}

export const productsService = new ProductsService();
