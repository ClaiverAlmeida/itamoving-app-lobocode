import { CheckCircle2, Container as ContainerIcon, Package, Ship, Truck, X } from "lucide-react";
import type { Container, ContainerBoxLine } from "../../api";
import type { DriverServiceOrderView } from "../../api/services/driver-service-order/service-order-form.service";

/** Remetente (EUA): prioriza dados completos da OS quando já carregados. */
export function serviceOrderSenderDisplayName(
  order: { senderName?: string | null },
  detail?: DriverServiceOrderView | null,
): string {
  const fromOs = detail?.sender?.usaName?.trim();
  if (fromOs) return fromOs;
  const fromList = order.senderName?.trim();
  if (fromList) return fromList;
  return "Remetente (EUA)";
}
import { resolveProductTypeLabel } from "../prices/products-prices/products-prices.utils";
import type { TransferBoxCandidate } from "./transfer-boxes-dialog/transfer-boxes-dialog.types";
import { MESES_PT } from "./containers.constants";

export const dataPickerBlocked = () => new Date().toISOString().split("T")[0];

export const toDateOnlyForInput = (value: string | undefined | null): string => {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  const match = s.match(/^\d{4}-\d{2}-\d{2}$/) || s.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? (match[1] ?? match[0]) : "";
};

export const formatDateOnlyForDisplay = (
  value: string | undefined | null,
  kind: "short" | "medium" | "long",
): string => {
  const raw = toDateOnlyForInput(value);
  if (!raw) return value ? String(value) : "";
  const [y, m, d] = raw.split("-");
  if (!y || !m || !d) return raw;
  const dd = d.padStart(2, "0");
  const mm = m.padStart(2, "0");
  const yy = y.length >= 2 ? y.slice(-2) : y;
  if (kind === "short") return `${dd}/${mm}/${yy}`;
  if (kind === "medium") return `${dd}/${mm}/${y}`;
  const mes = MESES_PT[parseInt(m, 10) - 1] ?? mm;
  return `${dd} de ${mes} de ${y}`;
};

export const getContainerStatusColor = (status: string) => {
  switch (status) {
    case "PREPARATION":
      return { bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-900", badge: "bg-yellow-100 text-yellow-700" };
    case "SHIPPED":
      return { bg: "bg-sky-50", border: "border-sky-500", text: "text-sky-950", badge: "bg-sky-100 text-sky-800" };
    case "IN_TRANSIT":
      return { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-900", badge: "bg-blue-100 text-blue-700" };
    case "DELIVERED":
      return { bg: "bg-green-50", border: "border-green-500", text: "text-green-900", badge: "bg-green-100 text-green-700" };
    case "CANCELLED":
      return { bg: "bg-red-50", border: "border-red-500", text: "text-red-900", badge: "bg-red-100 text-red-700" };
    default:
      return { bg: "bg-slate-50", border: "border-slate-500", text: "text-slate-900", badge: "bg-slate-100 text-slate-700" };
  }
};

export const getContainerStatusIcon = (status: string) => {
  switch (status) {
    case "PREPARATION":
      return Package;
    case "SHIPPED":
      return Truck;
    case "IN_TRANSIT":
      return Ship;
    case "DELIVERED":
      return CheckCircle2;
    case "CANCELLED":
      return X;
    default:
      return ContainerIcon;
  }
};

export const getContainerStatusLabel = (status: string) => {
  switch (status) {
    case "PREPARATION":
      return "Em Preparação";
    case "SHIPPED":
      return "Enviado";
    case "IN_TRANSIT":
      return "Em Trânsito";
    case "DELIVERED":
      return "Entregue";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
};

export type ServiceOrderAssociationFields = {
  attendant?: { id: string; name: string } | null;
};

/** Atendente da OS (gravado como `attendantId` ao vincular ao container; limpo ao desvincular). */
export function getServiceOrderAssociationCaption(order: ServiceOrderAssociationFields): string | null {
  const name = order.attendant?.name?.trim();
  if (!name) return null;
  return `Atendente: ${name}`;
}

export const getContainersByStatus = (containers: Container[]) => ({
  preparacao: containers.filter((c) => c.status === "PREPARATION"),
  transito: containers.filter((c) => c.status === "IN_TRANSIT" || c.status === "SHIPPED"),
  entregue: containers.filter((c) => c.status === "DELIVERED"),
  cancelado: containers.filter((c) => c.status === "CANCELLED"),
});

/** Etiqueta sequencial no container (ex.: `12-A`), quando já vinculada a um `ContainerProduct`. */
export function getContainerBoxLabel(box: {
  containerBoxNumber?: string | null;
  boxNumber?: string | null;
}): string | null {
  const bn = (box.containerBoxNumber ?? box.boxNumber)?.trim();
  return bn && bn.length > 0 ? bn : null;
}

/**
 * Linha física no payload `container.boxes` para uma linha de produto da OS
 * (etiqueta e tipo após transferência / renumeração).
 */
export function physicalBoxLineForOrderProduct(
  container: Container | null | undefined,
  driverServiceOrderProductId: string | undefined,
): ContainerBoxLine | undefined {
  if (!driverServiceOrderProductId || !container?.boxes?.length) return undefined;
  return container.boxes.find((b) => b.driverServiceOrderProductId === driverServiceOrderProductId);
}

/**
 * Mescla detalhe da OS com carga física do GET do container (evita etiqueta antiga após transferir caixa solta).
 */
export function mergeOrderProductWithPhysicalBox<
  T extends { id?: string; containerBoxNumber?: string | null; type?: string },
>(container: Container | null | undefined, line: T): T & { boxNumber?: string; size?: string } {
  const phys = physicalBoxLineForOrderProduct(container, line.id);
  if (!phys) return { ...line, boxNumber: line.containerBoxNumber ?? undefined };
  return {
    ...line,
    containerBoxNumber: phys.boxNumber,
    boxNumber: phys.boxNumber,
    type: phys.size || line.type,
    size: phys.size,
  };
}

/**
 * Texto para listas (transferência, etc.): etiqueta real + tipo do produto.
 * Sem etiqueta ainda, mostra só o tipo (evita `#1`, `#2`).
 */
export function formatServiceOrderBoxLine(
  box: { containerBoxNumber?: string | null; boxNumber?: string | null; type?: string; size?: string },
): string {
  const raw = (box.type ?? box.size)?.trim();
  const t = raw ? resolveProductTypeLabel(raw) : "—";
  const label = getContainerBoxLabel(box);
  return label ? `${label} · ${t}` : t;
}

/** Tipo de produto (enum da API) para exibição na UI de containers / OS. */
export function formatProductTypeForDisplay(raw: string | null | undefined): string {
  return resolveProductTypeLabel(raw);
}

/** IDs de linha de produto da OS presentes fisicamente neste container (payload `boxes`). */
export function productIdsOnPhysicalContainer(container: Container | null | undefined): Set<string> {
  const ids = new Set<string>();
  for (const b of container?.boxes ?? []) {
    if (b.driverServiceOrderProductId) ids.add(b.driverServiceOrderProductId);
  }
  return ids;
}

/** Mantém só produtos da OS cuja carga está neste container. */
export function filterDriverServiceProductsOnContainer<T extends { id?: string }>(
  products: T[] | undefined,
  container: Container | null | undefined,
): T[] {
  const ids = productIdsOnPhysicalContainer(container);
  if (ids.size === 0) return [];
  return (products ?? []).filter((p) => p.id && ids.has(p.id));
}

/**
 * Caixas físicas cuja ordem está vinculada a outro container — carga “solta” neste volume.
 */
export function getLoosePhysicalBoxes(container: Container | null | undefined): ContainerBoxLine[] {
  const cid = container?.id;
  if (!cid) return [];
  return (container?.boxes ?? []).filter(
    (b) =>
      b.orderPrimaryContainerId != null &&
      String(b.orderPrimaryContainerId) !== "" &&
      String(b.orderPrimaryContainerId) !== cid,
  );
}

/**
 * IDs de ordem a carregar para o painel/diálogo: vínculos do container + ordens referenciadas nas caixas físicas
 * (caixas “soltas” cuja OS está em outro container não aparecem em `serviceOrders` do GET).
 */
export function linkedDriverServiceOrderIdsToFetch(container: Container | null | undefined): string[] {
  const ids = new Set<string>();
  for (const o of container?.serviceOrders ?? []) {
    if (o.id?.trim()) ids.add(o.id.trim());
  }
  for (const b of container?.boxes ?? []) {
    if (b.driverServiceOrderId?.trim()) ids.add(b.driverServiceOrderId.trim());
  }
  return [...ids];
}

function senderLabelFromOrderView(d: DriverServiceOrderView): string {
  const s = d.sender?.usaName?.trim();
  if (s) return s;
  const apt = d.appointment?.client?.usaName?.trim();
  if (apt) return apt;
  return "Cliente";
}

/**
 * Candidatos à transferência: uma entrada por caixa física em `container.boxes` (inclui soltas).
 * Usa `linkedOrderDetails` quando a OS já foi carregada; senão cai no texto da linha física.
 */
export function buildTransferBoxCandidates(
  container: Container | null | undefined,
  linkedOrderDetails: Record<string, DriverServiceOrderView>,
): TransferBoxCandidate[] {
  const productByDspId = new Map<
    string,
    { detail: DriverServiceOrderView; product: NonNullable<DriverServiceOrderView["driverServiceOrderProducts"]>[number] }
  >();
  for (const detail of Object.values(linkedOrderDetails)) {
    if (!detail?.id) continue;
    for (const p of detail.driverServiceOrderProducts ?? []) {
      if (p.id) productByDspId.set(p.id, { detail, product: p });
    }
  }

  const out: TransferBoxCandidate[] = [];
  const seen = new Set<string>();
  for (const line of container?.boxes ?? []) {
    const dspId = line.driverServiceOrderProductId?.trim();
    if (!dspId || seen.has(dspId)) continue;
    seen.add(dspId);

    const found = productByDspId.get(dspId);
    const label = found
      ? formatServiceOrderBoxLine(mergeOrderProductWithPhysicalBox(container, found.product))
      : formatServiceOrderBoxLine(line);

    const orderContext = found
      ? `${senderLabelFromOrderView(found.detail)} · OS #${found.detail.id ?? "—"}`
      : `${line.clientName?.trim() || "Cliente"} · OS #${line.driverServiceOrderId ?? "—"}`;

    const w = found?.product?.weight ?? line.weight;
    const weightKg = typeof w === "number" && Number.isFinite(w) ? w : 0;

    out.push({
      driverServiceOrderProductId: dspId,
      label,
      orderContext,
      weightKg,
    });
  }
  return out;
}

