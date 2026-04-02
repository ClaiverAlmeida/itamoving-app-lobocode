import type { Container, ContainerBoxLine } from "../types";
import { toDateOnly } from "../../utils";
import type { ContainersBackend, CreateContainersDTO, UpdateContainersDTO } from "../types";
import { BaseCrudService } from "./base-crud.service";
import { api } from "./api.service";

function pickClientDisplayName(client?: {
  usaName?: string | null;
  brazilName?: string | null;
}): string {
  const u = client?.usaName?.trim() ?? "";
  if (u) return u;
  const b = client?.brazilName?.trim() ?? "";
  return b;
}

type BackendContainerProductRow = NonNullable<ContainersBackend["products"]>[number];

function pickLinkedDopForProduct(p: BackendContainerProductRow) {
  const dops = p.driverServiceOrderProducts ?? [];
  const byCp = dops.find(
    (d) => d.containerProductId != null && String(d.containerProductId) === String(p.id),
  );
  return byCp ?? dops[0];
}

function mapBackendToFrontend(container: ContainersBackend): Container {
  const fromProducts: ContainerBoxLine[] = Array.isArray(container.products)
    ? container.products.map((p) => {
        const linked = pickLinkedDopForProduct(p);
        const ord = linked?.driverServiceOrder;
        const itemsRaw = linked?.driverServiceOrderProductsItems ?? [];
        const items = itemsRaw
          .filter((it) => it == null || it.deletedAt == null)
          .map((it) => ({
            id: it.id,
            name: String(it.name ?? ""),
            quantity: Number(it.quantity) || 0,
            weight: Number(it.weight) || 0,
            observations: it.observations != null ? String(it.observations) : undefined,
          }));
        const clientFromOrder = ord?.appointment?.client;
        return {
          clientId: p.clientId ?? "",
          clientName:
            pickClientDisplayName(p.client ?? undefined) ||
            pickClientDisplayName(clientFromOrder ?? undefined) ||
            "",
          boxNumber: p.boxNumber,
          size: linked?.product?.type ?? p.size ?? "",
          weight: linked?.weight ?? p.weight ?? 0,
          driverServiceOrderProductId: linked?.id,
          driverServiceOrderId: linked?.driverServiceOrderId ?? ord?.id,
          orderPrimaryContainerId: ord?.containerId ?? null,
          items: items.length > 0 ? items : undefined,
        };
      })
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
    volumeCapacity:
      container.volumeCapacity !== undefined && container.volumeCapacity !== null
        ? container.volumeCapacity
        : Array.isArray(container.driverServiceOrders)
          ? container.driverServiceOrders.length
          : undefined,
    linkedServiceOrderCount: Array.isArray(container.driverServiceOrders)
      ? container.driverServiceOrders.length
      : undefined,
    serviceOrders: Array.isArray(container.driverServiceOrders)
      ? container.driverServiceOrders.map((o) => ({
          id: o.id,
          status: o.status,
          recipientName: o.appointment?.client?.usaName ?? null,
          createdAt: o.createdAt,
          attendant: o.attendant ? { id: o.attendant.id, name: o.attendant.name } : null,
        }))
      : undefined,
  };
}

export type AssignContainerServiceOrderPayload = {
  driverServiceOrderId: string;
  clientId: string;
  driverServiceOrderProductIds: string[];
  volumeLetter?: string;
};

export type TransferContainerBoxesPayload = {
  targetContainerId: string;
  driverServiceOrderProductIds: string[];
  volumeLetterForTarget?: string;
};

/** Resposta da API (prévia ou resultado interno da transferência). */
export type TransferContainerBoxesResult = {
  sourceContainer: {
    id: string;
    number: string;
    boxCountAfter: number;
    weightKgAfter: number;
    volumeCapacityAfter: number;
    volumeLetter: string | null;
  };
  targetContainer: {
    id: string;
    number: string;
    boxCountAfter: number;
    weightKgAfter: number;
    volumeCapacityAfter: number;
    volumeLetter: string | null;
  };
  transfers: Array<{
    driverServiceOrderProductId: string;
    containerProductId: string;
    driverServiceOrderId: string;
    oldBoxNumber: string;
    newBoxNumber: string;
    weightKg: number;
  }>;
  ordersReassigned: Array<{
    driverServiceOrderId: string;
    containerId: string;
    containerNumber: string;
  }>;
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

  async previewTransferBoxes(
    containerId: string,
    payload: TransferContainerBoxesPayload,
  ): Promise<{ success: boolean; data?: TransferContainerBoxesResult; error?: string }> {
    const result = await api.post<TransferContainerBoxesResult | { data: TransferContainerBoxesResult }>(
      `${this.resource}/${containerId}/transfer-boxes/preview`,
      payload,
    );
    if (!result.success) {
      return { success: false, error: result.error || "Não foi possível simular a transferência" };
    }
    const raw = this.unwrapData(result.data) as TransferContainerBoxesResult | undefined;
    if (!raw) return { success: false, error: "Resposta inválida da pré-visualização" };
    return { success: true, data: raw };
  }

  async transferBoxes(
    containerId: string,
    payload: TransferContainerBoxesPayload,
  ): Promise<{
    success: boolean;
    data?: {
      transfer: TransferContainerBoxesResult;
      sourceContainer: Container;
      targetContainer: Container;
    };
    error?: string;
  }> {
    const result = await api.post<
      | {
          transfer: TransferContainerBoxesResult;
          sourceContainer: ContainersBackend;
          targetContainer: ContainersBackend;
        }
      | {
          data: {
            transfer: TransferContainerBoxesResult;
            sourceContainer: ContainersBackend;
            targetContainer: ContainersBackend;
          };
        }
    >(`${this.resource}/${containerId}/transfer-boxes`, payload);
    if (!result.success) {
      return { success: false, error: result.error || "Não foi possível transferir as caixas" };
    }
    const raw = this.unwrapData(result.data) as
      | {
          transfer: TransferContainerBoxesResult;
          sourceContainer: ContainersBackend;
          targetContainer: ContainersBackend;
        }
      | undefined;
    if (!raw?.transfer || !raw.sourceContainer || !raw.targetContainer) {
      return { success: false, error: "Resposta inválida da transferência" };
    }
    return {
      success: true,
      data: {
        transfer: raw.transfer,
        sourceContainer: mapBackendToFrontend(raw.sourceContainer),
        targetContainer: mapBackendToFrontend(raw.targetContainer),
      },
    };
  }
}

export const containersServices = new ContainersService();
