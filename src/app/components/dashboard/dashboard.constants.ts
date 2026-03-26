import type { LucideIcon } from "lucide-react";

export type View =
  | "dashboard"
  | "clientes"
  | "estoque"
  | "agendamentos"
  | "containers"
  | "financeiro"
  | "relatorios"
  | "atendimentos";

export interface Alerta {
  id: string;
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  link?: string;
  navigateTo?: View;
}

export interface AtividadeRecente {
  id: string;
  tipo: "cliente" | "agendamento" | "container" | "estoque";
  descricao: string;
  data: Date;
  icone: LucideIcon;
  color: "blue" | "green" | "purple" | "orange";
}

export const ALARTE_COLOR_MAP = {
  critico: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", icon: "text-red-600" },
  atencao: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-900", icon: "text-yellow-600" },
  info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "text-blue-600" },
} as const;

