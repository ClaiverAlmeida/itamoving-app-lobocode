import type {
  CreateDeliveryPriceDTO,
  DeliveryPrice,
  DeliveryPricesPagination,
  UpdateDeliveryPriceEntregaDTO,
} from "../../../api";
import { deliveryPricesService, productsService } from "../../../api";

export async function getDeliveryPricesPage(params: { page: number; limit: number }) {
  return deliveryPricesService.getAll(params.page, params.limit);
}

export async function createDeliveryPrice(payload: CreateDeliveryPriceDTO) {
  return deliveryPricesService.create(payload);
}

export async function updateDeliveryPrice(id: string, patch: UpdateDeliveryPriceEntregaDTO) {
  return deliveryPricesService.update(id, patch);
}

export async function deleteDeliveryPrice(id: string) {
  return deliveryPricesService.delete(id);
}

export async function exportDeliveryPrices() {
  return deliveryPricesService.export();
}

/** Limite alto para o select de produtos no formulário (API paginada; default 10 omitia itens). */
const PRODUCT_PRICES_FORM_LIMIT = 500;

export async function getProductPrices() {
  return productsService.getAll(1, PRODUCT_PRICES_FORM_LIMIT);
}

export type DeliveryPricesExportResult = Awaited<ReturnType<typeof deliveryPricesService.export>>;
export type DeliveryPricesPaginationResult = DeliveryPricesPagination;
export type { DeliveryPrice };

