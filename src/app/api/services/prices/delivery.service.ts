import { api } from "../api.service";
import type { DeliveryPrice } from "../../types";
import { BaseCrudService } from "../base-crud.service";
import type {
  CreateDeliveryPriceDTO,
  DeliveryPriceBackend,
  DeliveryPricesPagination,
  UpdateDeliveryPriceEntregaDTO,
} from "../../types";

function mapBackendToFrontend(price: DeliveryPriceBackend): DeliveryPrice {
  return {
    id: price.id,
    originCity: price.originCity,
    originState: price.originState,
    destinationCity: price.destinationCity,
    destinationState: price.destinationState,
    pricePerKg: price.pricePerKg,
    minimumPrice: price.minimumPrice,
    deliveryDeadline: price.deliveryDeadline,
    active: price.active,
  };
}

export class DeliveryPricesService extends BaseCrudService<
  DeliveryPrice,
  DeliveryPriceBackend,
  CreateDeliveryPriceDTO,
  UpdateDeliveryPriceEntregaDTO,
  DeliveryPricesPagination
> {
  constructor() {
    super("/delivery-prices", mapBackendToFrontend, {
      listError: "Erro ao buscar preços de entrega",
      createError: "Erro ao criar preço de entrega",
      updateError: "Erro ao atualizar preço de entrega",
      deleteError: "Erro ao deletar preço de entrega",
    }, true);
  }

  async export(): Promise<{
    success: boolean;
    data?: DeliveryPrice[];
    error?: string;
  }> {
    try {
      const result = await api.get<{ data: DeliveryPriceBackend }>(
        "/delivery-prices/",
      );

      if (result.success && result.data) {
        const raw = result.data as any;
        const dataArray: DeliveryPriceBackend[] = Array.isArray(raw?.data)
          ? raw.data
          : [];
        const entregasMapeadas = dataArray.map(mapBackendToFrontend);
        return { success: true, data: entregasMapeadas };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message || "Erro ao exportar entregas" };
    }
  }
}

export const deliveryPricesService = new DeliveryPricesService();
