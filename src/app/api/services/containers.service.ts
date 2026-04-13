import type { Container, ContainerBoxLine } from "../types";
import { toDateOnly } from "../../utils";
import type { ContainersBackend, CreateContainersDTO, UpdateContainersDTO } from "../types";
import { BaseCrudService } from "./base-crud.service";
import { api } from "./api.service";

/** Nome do remetente (EUA) na carga — não usar `brazilName` (recebedor). */
function pickSenderNameFromClient(client?: {
  usaName?: string | null;
  brazilName?: string | null;
}): string {
  return client?.usaName?.trim() ?? "";
}

function pickSenderUsaFromDriverServiceOrder(o: {
  sender?: unknown;
  appointment?: { client?: { usaName?: string | null } | null } | null;
}): string | null {
  const raw = o.sender;
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    const usa = (raw as { usaName?: unknown }).usaName;
    if (typeof usa === "string" && usa.trim()) return usa.trim();
  }
  const apt = o.appointment?.client?.usaName?.trim();
  return apt && apt.length > 0 ? apt : null;
}

type BackendContainerProductRow = NonNullable<ContainersBackend["products"]>[number];

function isTapeAdhesive(raw: string | null | undefined): boolean {
  const normalized = String(raw ?? "").trim().toUpperCase();
  return normalized === "TAPE_ADHESIVE" || normalized.includes("FITA ADESIVA");
}

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
        const senderFromLinkedOrder = ord ? pickSenderUsaFromDriverServiceOrder(ord) : null;
        return {
          clientId: p.clientId ?? "",
          clientName:
            pickSenderNameFromClient(p.client ?? undefined) ||
            (senderFromLinkedOrder ?? "") ||
            pickSenderNameFromClient(clientFromOrder ?? undefined) ||
            "",
          boxNumber: p.boxNumber,
          size: linked?.product?.type ?? p.size ?? "",
          weight: linked?.weight ?? p.weight ?? 0,
          value: linked?.value ?? 0,
          driverServiceOrderProductId: linked?.id,
          driverServiceOrderId: linked?.driverServiceOrderId ?? ord?.id,
          orderPrimaryContainerId: ord?.containerId ?? null,
          items: items.length > 0 ? items : undefined,
        };
      })
    : [];
  const rawBoxes = fromProducts.length ? fromProducts : container.boxes ?? [];
  const boxes = rawBoxes.filter((box) => !isTapeAdhesive(box.size));
  const tapeLines = rawBoxes.filter((box) => isTapeAdhesive(box.size));
  const tapesUsed = {
    quantity: tapeLines.length,
    weight: tapeLines.reduce((sum, line) => sum + (Number(line.weight) || 0), 0),
    value: tapeLines.reduce((sum, line) => sum + (Number(line.value) || 0), 0),
  };
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
    tapesUsed,
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
          senderName: pickSenderUsaFromDriverServiceOrder(o),
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
};

export type TransferContainerBoxesPayload = {
  targetContainerId: string;
  driverServiceOrderProductIds: string[];
  volumeLetterForTarget?: string;
};

/** Mesmo cálculo da API de vinculação OS → container (sequência N-LETRA). */
export type PreviewBoxLabelsPayload = {
  existingBoxNumbers: string[];
  letter: string;
  count: number;
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

  async previewBoxLabels(
    payload: PreviewBoxLabelsPayload,
  ): Promise<{ success: boolean; data?: { labels: string[] }; error?: string }> {
    const result = await api.post<
      { labels: string[] } | { data: { labels: string[] } }
    >(`${this.resource}/box-labels/preview`, payload);
    if (!result.success) {
      return { success: false, error: result.error ?? "Erro ao calcular etiquetas" };
    }
    const raw = result.data as { labels?: string[]; data?: { labels: string[] } } | undefined;
    const labels = raw?.data?.labels ?? raw?.labels;
    if (!Array.isArray(labels)) {
      return { success: false, error: "Resposta inválida ao calcular etiquetas" };
    }
    return { success: true, data: { labels } };
  }
}

export const containersServices = new ContainersService();
