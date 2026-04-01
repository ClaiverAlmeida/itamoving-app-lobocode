import type { Container } from "../../api";
import type { StatusSelectItem } from "../forms";

/** Referência fixa só no frontend (caixas); aviso vermelho ao ultrapassar; não persiste no banco. */
export const VOLUME_REFERENCIA_INFORMATIVO = 220;

export type ContainersViewMode = "grid" | "list" | "kanban";

export type ContainerStatusFilter =
  | "todos"
  | "PREPARATION"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export const CONTAINER_STATUS_ITEMS = [
  { value: "PREPARATION", label: "Em Preparação" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "IN_TRANSIT", label: "Em Trânsito" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "SHIPPED", label: "Enviado" },
] as const satisfies readonly StatusSelectItem<Container["status"]>[];

export const MESES_PT: string[] = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

