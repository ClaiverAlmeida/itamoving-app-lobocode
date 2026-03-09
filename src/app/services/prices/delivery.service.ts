import { api } from "../api.service";
import { PrecoEntrega } from "../../types";

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

export interface DeliveryPricesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

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
  async getAll(
    page = 1,
    limit = 10,
  ): Promise<{
    success: boolean;
    data?: PrecoEntrega[];
    pagination?: DeliveryPricesPagination;
    error?: string;
  }> {
    try {
      const result = await api.get<{
        data: DeliveryPriceBackend[];
        pagination: DeliveryPricesPagination;
      }>(`/delivery-prices/?page=${page}&limit=${limit}`);
      if (result.success && result.data) {
        const raw = result.data as any;
        const dataArray: DeliveryPriceBackend[] = Array.isArray(raw?.data)
          ? raw.data
          : [];
        const pagination = raw?.pagination as
          | DeliveryPricesPagination
          | undefined;

        const deliveryPricesMapeados = dataArray.map(mapBackendToFrontend);
        return {
          success: true,
          data: deliveryPricesMapeados,
          ...(pagination && { pagination }),
        };
      }
      return {
        success: false,
        error: result.error || "Erro ao buscar preços de entrega",
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
  ): Promise<{ success: boolean; data?: PrecoEntrega; error?: string }> {
    try {
      const result = await api.patch<
        DeliveryPriceBackend | { data: DeliveryPriceBackend }
      >(`/delivery-prices/${id}`, data);

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

  async export(): Promise<{
    success: boolean;
    data?: PrecoEntrega[];
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
      return { success: false, error: "Erro ao exportar entregas" };
    }
  }
}

export const deliveryPricesService = new DeliveryPricesService();
