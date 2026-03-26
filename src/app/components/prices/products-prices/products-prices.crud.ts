import type { CreateProductPriceDTO, ProductPricePagination, UpdateProductPriceDTO } from "../../../api";
import { productsService } from "../../../api";

export async function getProductsPage(params: { page: number; limit: number }) {
  return productsService.getAll(params.page, params.limit);
}

export async function createProductPrice(payload: CreateProductPriceDTO) {
  return productsService.create(payload);
}

export async function updateProductPrice(id: string, patch: UpdateProductPriceDTO) {
  return productsService.update(id, patch);
}

export async function deleteProductPrice(id: string) {
  return productsService.delete(id);
}

export async function exportProducts() {
  return productsService.export();
}

export type ProductPriceExportResult = Awaited<ReturnType<typeof productsService.export>>;
export type ProductPricePaginationResult = ProductPricePagination;

