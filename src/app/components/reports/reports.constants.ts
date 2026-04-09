import {
  BarChart3,
  Boxes,
  DollarSign,
  UserCheck,
  Users,
} from "lucide-react";
import type React from "react";

export type ReportType = "visao-geral" | "clientes" | "financeiro" | "operacional" | "atendimento";

export const REPORT_TYPES: Array<{
  id: ReportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "visao-geral", label: "Visão Geral", icon: BarChart3 },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "operacional", label: "Operacional", icon: Boxes },
  { id: "atendimento", label: "Atendimento", icon: UserCheck },
];

export const REPORT_GRADIENT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

