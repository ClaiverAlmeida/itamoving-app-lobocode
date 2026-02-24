import { api } from "./api.service";
import { PrecoEntrega } from "../types";

export interface CreateDeliveryPriceDTO {
  id?: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pricePerKg: number;
  minimumPrice: number;
  deliveryDeadline: number; // dias
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
  deliveryDeadline: number; // dias
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateDeliveryPriceEntregaDTO = Partial<CreateDeliveryPriceDTO>;

function mapBackendToFrontend(price: DeliveryPriceBackend): PrecoEntrega {
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

export class DeliveryPricesService {
  async getAll(): Promise<{
    success: boolean;
    data?: PrecoEntrega[];
    error?: string;
  }> {
    try {
      const response =
        await api.get<DeliveryPriceBackend[]>("/delivery-prices");
      if (response.success && response.data) {
        // O backend retorna um array diretamente, então response.data já é o array
        let dataArray: DeliveryPriceBackend[] = [];

        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === "object") {
          // Caso o backend retorne um objeto com propriedade data
          dataArray = (response.data as any).data || [];
        }

        // Mapeia cada preço de entrega do backend para o formato do frontend
        const deliveryPricesMapeados = dataArray.map(mapBackendToFrontend);
        return {
          success: true,
          data: deliveryPricesMapeados,
        };
      }
      return {
        success: false,
        error: response.error || "Erro ao buscar preços de entrega",
      };
    } catch (error) {
      console.error("Erro ao buscar preços de entrega:", error);
      return {
        success: false,
        error: "Erro ao buscar preços de entrega",
      };
    }
  }

  async create(
    data: CreateDeliveryPriceDTO,
  ): Promise<{ success: boolean; data?: PrecoEntrega; error?: string }> {
    try {
      const result = await api.post<DeliveryPriceBackend>(
        "/delivery-prices",
        data,
      );
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const deliveryPriceBackend = raw as DeliveryPriceBackend;
        const deliveryPrice = mapBackendToFrontend(deliveryPriceBackend);
        return { success: true, data: deliveryPrice };
      } else {
        return { success: false, error: "Erro ao criar preço de entrega" };
      }
    } catch (error) {
      return { success: false, error: "Erro ao criar preço de entrega" };
    }
  }

  
  async update(
    id: string,
    data: UpdateDeliveryPriceEntregaDTO,
    changes?: Record<string, { before?: unknown; after?: unknown }>,
  ): Promise<{ success: boolean; data?: PrecoEntrega; error?: string }> {
    try {
      const body = changes ? { data, changes } : { data };
      const result = await api.patch<DeliveryPriceBackend | { data: DeliveryPriceBackend }>(
        `/delivery-prices/${id}`,
        body,
      );

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const deliveryPriceBackend = raw as DeliveryPriceBackend;
        const deliveryPrice = mapBackendToFrontend(deliveryPriceBackend);
        return { success: true, data: deliveryPrice };
      }

      return { success: false, error: "Erro ao atualizar preço de entrega" };
    } catch (error) {
      return { success: false, error: "Erro ao atualizar preço de entrega" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete<{ data: PrecoEntrega }>(
        `/delivery-prices/${id}`,
      );

      if (result.success && result.data) {
        return { success: true };
      }

      return { success: false, error: "Erro ao deletar preço de entrega" };
    } catch (error) {
      return { success: false, error: "Erro ao deletar preço de entrega" };
    }
  }
}

export const deliveryPricesService = new DeliveryPricesService();
