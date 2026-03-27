import { api } from "../api.service";
import { PrecoProduto } from "../../types";
import { BaseCrudService } from "../base-crud.service";
import type {
  CreateProductPriceDTO,
  ProductPriceBackend,
  ProductPricePagination,
  UpdateProductPriceDTO,
} from "../../types";

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

export class ProductsService extends BaseCrudService<
  PrecoProduto,
  ProductPriceBackend,
  CreateProductPriceDTO,
  UpdateProductPriceDTO,
  ProductPricePagination
> {
  constructor() {
    super("/product-prices", mapBackendToFrontend, {
      listError: "Erro ao buscar produtos",
      createError: "Erro ao criar produto",
      updateError: "Erro ao atualizar produto",
      deleteError: "Erro ao deletar produto",
    }, true);
  }

  /**
   * Lista produtos incluindo soft-deleted (somente para edição de ordem de serviço).
   */
  async getAllForServiceOrderEdit(driverServiceOrderId?: string): Promise<{
    success: boolean;
    data?: PrecoProduto[];
    error?: string;
  }> {
    const result = await api.get<ProductPriceBackend[] | { data: ProductPriceBackend[] }>(
      `${this.resource}/service-order-edit-options`,
      {
        ...(driverServiceOrderId
          ? { params: { driverServiceOrderId } }
          : {}),
      },
    );
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.listError };
    }
    const items = this.unwrapList(result.data);
    return { success: true, data: items.map(this.mapBackendToFrontend) };
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
      return { success: false, error: error.message || "Erro ao exportar produtos" };
    }
  }
}

export const productsService = new ProductsService();
