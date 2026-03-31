import { Container } from "../types";
import { toDateOnly } from "../../utils";
import type { ContainersBackend, CreateContainersDTO, UpdateContainersDTO } from "../types";
import { BaseCrudService } from "./base-crud.service";
import { api } from "./api.service";

function mapBackendToFrontend(container: ContainersBackend): Container {
  const fromProducts = Array.isArray(container.products)
    ? container.products.map((p) => ({
        clientId: p.clientId ?? "",
        clientName: p.clientName ?? "",
        boxNumber: p.boxNumber,
        size: p.size,
        weight: p.weight,
      }))
    : [];
  const boxes = fromProducts.length ? fromProducts : container.boxes ?? [];
  const totalWeight =
    container.totalWeight ?? boxes.reduce((s, b) => s + (b?.weight ?? 0), 0);
  return {
    id: container.id,
    number: container.number,
    type: container.type,
    seal: container.seal,
    origin: container.origin,
    destination: container.destination,
    shipmentDate: toDateOnly(container.shipmentDate),
    boardingDate: toDateOnly(container.boardingDate),
    estimatedArrival: toDateOnly(container.estimatedArrival),
    volume: container.volume,
    emptyWeight: container.emptyWeight ?? undefined,
    fullWeight: container.fullWeight ?? undefined,
    trackingLink: container.trackingLink,
    status: container.status as Container["status"],
    totalWeight,
    boxes,
    volumeLetter: container.volumeLetter ?? undefined,
    volumeCapacity: container.volumeCapacity ?? 220,
    linkedServiceOrderCount: Array.isArray(container.driverServiceOrders)
      ? container.driverServiceOrders.length
      : undefined,
    serviceOrders: Array.isArray(container.driverServiceOrders)
      ? container.driverServiceOrders.map((o) => ({
          id: o.id,
          status: o.status,
          recipientName: o.appointment?.client?.usaName ?? null,
          createdAt: o.createdAt,
        }))
      : undefined,
  };
}

export type AssignContainerServiceOrderPayload = {
  driverServiceOrderId: string;
  volumeLetter?: string;
};

export class ContainersService extends BaseCrudService<
  Container,
  ContainersBackend,
  CreateContainersDTO,
  UpdateContainersDTO
> {
  constructor() {
    super("/containers", mapBackendToFrontend, {
      listError: "Erro ao buscar containers",
      createError: "Erro ao cadastrar container",
      updateError: "Erro ao atualizar container",
      deleteError: "Erro ao excluir container",
    });
  }

  async getById(id: string): Promise<{ success: boolean; data?: Container; error?: string }> {
    const result = await api.get<ContainersBackend | { data: ContainersBackend }>(
      `${this.resource}/${id}`,
    );
    if (!result.success) {
      return { success: false, error: result.error || "Erro ao buscar container" };
    }
    const raw = this.unwrapData(result.data);
    if (!raw) return { success: false, error: "Erro ao buscar container" };
    return { success: true, data: mapBackendToFrontend(raw as ContainersBackend) };
  }

  async assignServiceOrder(
    containerId: string,
    payload: AssignContainerServiceOrderPayload,
  ): Promise<{ success: boolean; data?: Container; error?: string }> {
    const result = await api.post<ContainersBackend | { data: ContainersBackend }>(
      `${this.resource}/${containerId}/assign-service-order`,
      payload,
    );
    if (!result.success) {
      return { success: false, error: result.error || "Erro ao vincular ordem de serviço" };
    }
    const raw = this.unwrapData(result.data);
    if (!raw) return { success: false, error: "Erro ao vincular ordem de serviço" };
    return { success: true, data: mapBackendToFrontend(raw as ContainersBackend) };
  }

  async unassignServiceOrder(
    containerId: string,
    driverServiceOrderId: string,
  ): Promise<{ success: boolean; data?: Container; error?: string }> {
    const result = await api.patch<ContainersBackend | { data: ContainersBackend }>(
      `${this.resource}/${containerId}/unassign-service-order/${driverServiceOrderId}`,
      {},
    );
    if (!result.success) {
      return { success: false, error: result.error || "Erro ao desvincular ordem de serviço" };
    }
    const raw = this.unwrapData(result.data);
    if (!raw) return { success: false, error: "Erro ao desvincular ordem de serviço" };
    return { success: true, data: mapBackendToFrontend(raw as ContainersBackend) };
  }
}

export const containersServices = new ContainersService();
