import { api } from "./api.service";
import { Container } from "../types";
import { toDateOnly } from "../utils";

export interface CreateContainersDTO {
  number: string;
  type: "C20FT" | "C40FT" | "C40FTHC" | "C45FTHC";
  origin: string;
  destination: string;
  boardingDate: string;
  estimatedArrival: string;
  volume: number;
  weightLimit: number;
  trackingLink: string;
  status: "PREPARATION" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
}

export type UpdateContainersDTO = Partial<CreateContainersDTO>;

export interface ContainersBackend {
  id: string;
  number: string;
  type?: "C20FT" | "C40FT" | "C40FTHC" | "C45FTHC";
  origin?: string;
  destination?: string;
  shipmentDate?: string;
  boardingDate?: string;
  estimatedArrival?: string;
  volume?: number;
  weightLimit: number;
  trackingLink?: string;
  status: string;
  totalWeight?: number;
  boxes?: { clientId: string; clientName: string; boxNumber: string; size: string; weight: number }[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

function mapBackendToFrontend(container: ContainersBackend): Container {
  const boxes = container.boxes ?? [];
  const totalWeight =
    container.totalWeight ?? boxes.reduce((s, b) => s + (b?.weight ?? 0), 0);
  return {
    id: container.id,
    number: container.number,
    type: container.type,
    origin: container.origin,
    destination: container.destination,
    shipmentDate: toDateOnly(container.shipmentDate),
    boardingDate: toDateOnly(container.boardingDate),
    estimatedArrival: toDateOnly(container.estimatedArrival),
    volume: container.volume,
    weightLimit: container.weightLimit ?? 0,
    trackingLink: container.trackingLink,
    status: container.status as Container["status"],
    totalWeight,
    boxes,
  };
}

export class ContainersService {
  async getAll(): Promise<{ success: boolean; data?: Container[]; error?: string }> {
    try {
      const result = await api.get<ContainersBackend[] | { data: ContainersBackend[] }>("/containers");
      if (!result.success) return { success: false, error: result.error ?? "Erro ao buscar containers" };
      const raw = result.data as ContainersBackend[] | { data: ContainersBackend[] } | undefined;
      const list = Array.isArray(raw) ? raw : raw?.data ?? [];
      const containers = list.map(mapBackendToFrontend);
      return { success: true, data: containers };
    } catch {
      return { success: false, error: "Erro ao buscar containers" };
    }
  }

  async create(
    data: CreateContainersDTO,
  ): Promise<{ success: boolean; data?: Container; error?: string }> {
    try {
      const result = await api.post<
        ContainersBackend | { data: ContainersBackend }
      >("/containers", data);

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const containersBackend = raw as ContainersBackend;
        const container = mapBackendToFrontend(containersBackend);
        return { success: true, data: container };
      }

      return { success: false, error: `Erro ao cadastrar container: ${result.error}` };
    } catch (error) {
      return { success: false, error: `Erro ao cadastrar container: ${error}` };
    }
  }

  async update(
    id: string,
    data: UpdateContainersDTO,
  ): Promise<{ success: boolean; data?: Container; error?: string }> {
    try {
      const result = await api.patch<
        ContainersBackend | { data: ContainersBackend }
      >(`/containers/${id}`, data);
      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const containersBackend = raw as ContainersBackend;
        const container = mapBackendToFrontend(containersBackend);
        return { success: true, data: container };
      }
      return { success: false, error: "Erro ao atualizar container" };
    } catch (error) {
      return { success: false, error: "Erro ao atualizar container" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete<
        ContainersBackend | { data: ContainersBackend }
      >(`/containers/${id}`);
      if (result.success && result.data) {
        return { success: true };
      }
      return { success: false, error: "Erro ao excluir container" };
    } catch (error) {
      return { success: false, error: "Erro ao excluir container" };
    }
  }
}

export const containersServices = new ContainersService();
