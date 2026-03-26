import type {
  CreateDeliveryPriceDTO,
  DeliveryPricesPagination,
  PrecoEntrega,
  UpdateDeliveryPriceEntregaDTO,
} from "../../../api";
import { deliveryPricesService } from "../../../api";

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

export type DeliveryPricesExportResult = Awaited<ReturnType<typeof deliveryPricesService.export>>;
export type DeliveryPricesPaginationResult = DeliveryPricesPagination;
export type DeliveryPrice = PrecoEntrega;

