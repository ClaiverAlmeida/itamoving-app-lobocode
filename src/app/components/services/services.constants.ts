import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Flame,
  MessageCircle,
  Minus,
  Timer,
  User,
} from "lucide-react";
import type { LeadPriority, LeadStatus, LeadsFilters } from "./services.types";

export const STATUS_ORDER: LeadStatus[] = [
  "Novo",
  "Qualificando",
  "Orçamento",
  "Negociando",
  "Fechado",
  "Perdido",
];

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; icon: any }
> = {
  Novo: { label: "Novos", color: "bg-blue-500", icon: AlertCircle },
  Qualificando: { label: "Qualificando", color: "bg-purple-500", icon: User },
  Orçamento: { label: "Orçamento enviado", color: "bg-yellow-500", icon: DollarSign },
  Negociando: { label: "Negociando", color: "bg-orange-500", icon: MessageCircle },
  Fechado: { label: "Fechado", color: "bg-green-500", icon: CheckCircle2 },
  Perdido: { label: "Perdido", color: "bg-red-500", icon: AlertCircle },
};

export const PRIORIDADE_CONFIG: Record<
  LeadPriority,
  { label: string; color: string; bg: string; icon: any }
> = {
  Alta: { label: "Alta", color: "text-red-600", bg: "bg-red-50", icon: Flame },
  Média: { label: "Média", color: "text-yellow-600", bg: "bg-yellow-50", icon: Timer },
  Baixa: { label: "Baixa", color: "text-slate-600", bg: "bg-slate-50", icon: Minus },
};

export const INITIAL_LEADS_FILTERS: LeadsFilters = {
  prioridade: [],
  origem: "",
  valorMin: "",
  valorMax: "",
  periodo: "todos",
};

