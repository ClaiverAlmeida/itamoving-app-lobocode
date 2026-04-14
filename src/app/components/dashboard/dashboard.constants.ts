import type { LucideIcon } from "lucide-react";
import type { Appointment } from "../../api";

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

type DashboardAppointmentStatusStyle = {
  label: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
};

export const DASHBOARD_APPOINTMENT_STATUS_STYLE_MAP: Record<Appointment["status"], DashboardAppointmentStatusStyle> = {
  PENDING: {
    label: "Pendente",
    cardBg: "bg-yellow-50",
    cardBorder: "border-yellow-500",
    badgeBg: "bg-yellow-500",
    badgeText: "text-white",
  },
  CONFIRMED: {
    label: "Confirmado",
    cardBg: "bg-green-50",
    cardBorder: "border-green-500",
    badgeBg: "bg-green-600",
    badgeText: "text-white",
  },
  COLLECTED: {
    label: "Coletado",
    cardBg: "bg-blue-50",
    cardBorder: "border-blue-500",
    badgeBg: "bg-blue-600",
    badgeText: "text-white",
  },
  CANCELLED: {
    label: "Cancelado",
    cardBg: "bg-red-50",
    cardBorder: "border-red-500",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
  },
};

