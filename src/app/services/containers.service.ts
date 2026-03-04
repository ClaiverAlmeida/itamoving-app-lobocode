import { api } from "./api.service";
import { Container } from "../types";

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
  type: "C20FT" | "C40FT" | "C40FTHC" | "C45FTHC";
  origin: string;
  destination: string;
  boardingDate: string;
  estimatedArrival: string;
  volume: number;
  weightLimit: number;
  trackingLink: string;
  status: "PREPARATION" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

function mapBackendToFrontend(container: ContainersBackend): Container {
  return {
    id: container.id,
    number: container.number,
    type: container.type,
    origin: container.origin,
    destination: container.destination,
    boardingDate: container.boardingDate,
    estimatedArrival: container.estimatedArrival,
    volume: container.volume,
    weightLimit: container.weightLimit,
    trackingLink: container.trackingLink,
    status: container.status,
  };
}

export class ContainersService {
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

      return { success: false, error: "Erro ao criar container" };
    } catch (error) {
      return { success: false, error: "Erro ao criar container" };
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
