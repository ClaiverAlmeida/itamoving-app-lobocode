import { CheckCircle2, Container as ContainerIcon, Package, Ship, Truck, X } from "lucide-react";
import type { Container } from "../../api";
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

