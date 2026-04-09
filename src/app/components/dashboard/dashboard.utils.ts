import type { Appointment, Client, Container, Estoque, FinancialTransaction } from "../../api";

const APPOINTMENT_STATUS_LABEL: Record<Appointment["status"], string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COLLECTED: "Coletado",
  CANCELLED: "Cancelado",
};

/** Considera editado quando `updatedAt` é claramente posterior a `createdAt`. */
export function isAgendamentoEditado(a: Pick<Appointment, "createdAt" | "updatedAt">): boolean {
  if (!a.updatedAt) return false;
  if (!a.createdAt) return true;
  return new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime() > 1500;
}

export function descricaoAtividadeAgendamento(a: Appointment): string {
  const nome = a.client?.name?.trim() || "Cliente";
  const status = APPOINTMENT_STATUS_LABEL[a.status] ?? a.status;
  if (isAgendamentoEditado(a)) {
    return `Agendamento editado — ${nome} — status: ${status}`;
  }
  return `Agendamento criado para ${nome}`;
}

export function dataAtividadeAgendamento(a: Appointment): Date {
  if (isAgendamentoEditado(a) && a.updatedAt) return new Date(a.updatedAt);
  if (a.createdAt) return new Date(a.createdAt);
  if (a.updatedAt) return new Date(a.updatedAt);
  return new Date();
}
import { format, isPast, isToday, isValid, startOfMonth, subDays, subMonths } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { ALARTE_COLOR_MAP, type Alerta, type AtividadeRecente } from "./dashboard.constants";
import { ptBR } from "date-fns/locale/pt-BR";
import { parseApiDateToLocalDate, toDateOnly } from "../../utils/date";

export type FinanceiroDataPoint = { mes: string; receitas: number; despesas: number; lucro: number };
export type ContainerStatusDataPoint = { name: string; value: number; color: string };
export type EstoqueDataPoint = { tipo: string; quantidade: number; fill: string };
export type PerformanceDataPoint = { dia: string; clientes: number; agendamentos: number; containers: number };

export function getAgendamentosCounts(agendamentos: Appointment[]) {
  const hoje = new Date().toISOString().split("T")[0];
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const agendamentosHoje = agendamentos.filter((a) => a.collectionDate === hoje).length;
  const agendamentosAmanha = agendamentos.filter((a) => a.collectionDate === amanha).length;
  const agendamentosPendentes = agendamentos.filter((a) => a.status === "PENDING").length;
  return { agendamentosHoje, agendamentosAmanha, agendamentosPendentes };
}

export function getEstoqueTotals(estoque: Estoque) {
  const estoqueTotal =
    Number(estoque.smallBoxes) +
    Number(estoque.mediumBoxes) +
    Number(estoque.largeBoxes) +
    Number(estoque.adhesiveTape) +
    Number(estoque.personalizedItems);

  const estoqueBaixo = [
    { tipo: "Caixas Pequenas", qtd: Number(estoque.smallBoxes), minimo: 50 },
    { tipo: "Caixas Médias", qtd: Number(estoque.mediumBoxes), minimo: 30 },
    { tipo: "Caixas Grandes", qtd: Number(estoque.largeBoxes), minimo: 20 },
    { tipo: "Itens Personalizados", qtd: Number(estoque.personalizedItems), minimo: 10 },
    { tipo: "Fitas", qtd: Number(estoque.adhesiveTape), minimo: 40 },
  ].filter((item) => item.qtd < item.minimo);

  return { estoqueTotal, estoqueBaixo };
}

export function getContainersStats(containers: Container[]) {
  const containersAtivos = containers.filter(
    (c) =>
      c.status === "PREPARATION" ||
      c.status === "IN_TRANSIT" ||
      c.status === "SHIPPED" ||
      c.status === "DELIVERED" ||
      c.status === "CANCELLED",
  ).length;

  const containersEmTransito = containers.filter((c) => c.status === "IN_TRANSIT").length;
  return { containersAtivos, containersEmTransito };
}

const FINANCEIRO_CHART_MONTHS = 6;

/** Receitas, despesas e lucro por mês (calendário), últimos 6 meses incluindo o atual. */
export function buildFinanceiroData(transacoes: FinancialTransaction[]): FinanceiroDataPoint[] {
  const now = new Date();
  const points: FinanceiroDataPoint[] = [];
  const keys: string[] = [];

  for (let i = FINANCEIRO_CHART_MONTHS - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
    keys.push(key);
    points.push({
      mes: format(monthStart, "MMM/yy", { locale: ptBR }),
      receitas: 0,
      despesas: 0,
      lucro: 0,
    });
  }

  const keyToIndex = new Map(keys.map((k, idx) => [k, idx]));

  for (const t of transacoes) {
    const dt = parseApiDateToLocalDate(t.date);
    if (!isValid(dt)) continue;
    const k = `${dt.getFullYear()}-${dt.getMonth()}`;
    const idx = keyToIndex.get(k);
    if (idx === undefined) continue;
    if (t.type === "REVENUE") points[idx].receitas += Number(t.value) || 0;
    else points[idx].despesas += Number(t.value) || 0;
  }

  for (const p of points) {
    p.lucro = p.receitas - p.despesas;
  }

  return points;
}

/** Variação % das receitas entre o penúltimo e o último mês do gráfico (para selo no card). */
export function formatReceitasMoMChangeLabel(data: FinanceiroDataPoint[]): string | null {
  if (data.length < 2) return null;
  const prev = data[data.length - 2].receitas;
  const cur = data[data.length - 1].receitas;
  if (prev === 0 && cur === 0) return null;
  if (prev === 0) return null;
  const pct = ((cur - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

export function buildContainersStatusData(containers: Container[]): ContainerStatusDataPoint[] {
  return [
    { name: "Em Preparação", value: containers.filter((c) => c.status === "PREPARATION").length, color: "#F5A623" },
    { name: "Em Trânsito", value: containers.filter((c) => c.status === "IN_TRANSIT").length, color: "#5DADE2" },
    { name: "Entregue", value: containers.filter((c) => c.status === "DELIVERED").length, color: "#10B981" },
    { name: "Cancelado", value: containers.filter((c) => c.status === "CANCELLED").length, color: "#EF4444" },
  ];
}

export function buildEstoqueData(estoque: Pick<Estoque, "smallBoxes" | "mediumBoxes" | "largeBoxes" | "personalizedItems" | "adhesiveTape">): EstoqueDataPoint[] {
  return [
    { tipo: "Pequenas", quantidade: Number(estoque.smallBoxes ?? 0), fill: "#5DADE2" },
    { tipo: "Médias", quantidade: Number(estoque.mediumBoxes ?? 0), fill: "#F5A623" },
    { tipo: "Grandes", quantidade: Number(estoque.largeBoxes ?? 0), fill: "#1E3A5F" },
    { tipo: "Itens Personalizados", quantidade: Number(estoque.personalizedItems ?? 0), fill: "#94A3B8" },
    { tipo: "Fitas", quantidade: Number(estoque.adhesiveTape ?? 0), fill: "#94A3B8" },
  ];
}

function weekdayLabelPt(day: Date): string {
  const raw = format(day, "EEE", { locale: ptBR }).replace(/\.$/, "");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function containerActivityDateYmd(c: Container): string {
  const boarding = c.boardingDate ? toDateOnly(c.boardingDate) : "";
  if (boarding) return boarding;
  return c.shipmentDate ? toDateOnly(c.shipmentDate) : "";
}

/** Contagens por dia civil (últimos 7 dias, do mais antigo ao mais recente), alinhado à descrição do gráfico. */
export function buildPerformanceData(params: {
  clientes: Client[];
  agendamentos: Appointment[];
  containers: Container[];
}): PerformanceDataPoint[] {
  const { clientes, agendamentos, containers } = params;
  const out: PerformanceDataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = subDays(new Date(), i);
    day.setHours(0, 0, 0, 0);
    const ymd = format(day, "yyyy-MM-dd");

    const clientesN = clientes.filter((c) => toDateOnly(c.createdAt) === ymd).length;
    const agendamentosN = agendamentos.filter((a) => a.collectionDate && toDateOnly(a.collectionDate) === ymd).length;
    const containersN = containers.filter((c) => containerActivityDateYmd(c) === ymd).length;

    out.push({
      dia: weekdayLabelPt(day),
      clientes: clientesN,
      agendamentos: agendamentosN,
      containers: containersN,
    });
  }

  return out;
}

export function getAlertaColor(tipo: Alerta["tipo"]) {
  return ALARTE_COLOR_MAP[tipo];
}

export function buildAlertas(params: {
  agendamentos: Appointment[];
  estoqueBaixo: { tipo: string; qtd: number; minimo: number }[];
  agendamentosHoje: number;
  containersEmTransito: number;
  icons: {
    AlertTriangle: LucideIcon;
    Package: LucideIcon;
    Calendar: LucideIcon;
    Truck: LucideIcon;
  };
}) {
  const { agendamentos, estoqueBaixo, agendamentosHoje, containersEmTransito, icons } = params;
  const alerts: Alerta[] = [];

  const atrasados = agendamentos.filter((a) => {
    const dataAgendamento = new Date(a.collectionDate + "T00:00:00");
    return isPast(dataAgendamento) && a.status === "PENDING" && !isToday(dataAgendamento);
  });

  if (atrasados.length > 0) {
    alerts.push({
      id: "agendamentos-atrasados",
      tipo: "critico",
      titulo: "Agendamentos Atrasados",
      descricao: `${atrasados.length} agendamento(s) pendente(s) com data vencida`,
      icone: icons.AlertTriangle,
      navigateTo: "agendamentos",
    });
  }

  if (estoqueBaixo.length > 0) {
    alerts.push({
      id: "estoque-baixo",
      tipo: "atencao",
      titulo: "Estoque Baixo",
      descricao: `${estoqueBaixo.length} item(ns) abaixo do mínimo recomendado`,
      icone: icons.Package,
      navigateTo: "estoque",
    });
  }

  if (agendamentosHoje > 0) {
    alerts.push({
      id: "agendamentos-hoje",
      tipo: "info",
      titulo: "Agendamentos Hoje",
      descricao: `${agendamentosHoje} coleta(s) programada(s) para hoje`,
      icone: icons.Calendar,
      navigateTo: "agendamentos",
    });
  }

  if (containersEmTransito > 0) {
    alerts.push({
      id: "containers-transito",
      tipo: "info",
      titulo: "Containers em Trânsito",
      descricao: `${containersEmTransito} container(s) em transporte marítimo`,
      icone: icons.Truck,
      navigateTo: "containers",
    });
  }

  return alerts;
}

export function buildAtividadesRecentes(params: {
  clientes: Client[];
  agendamentos: Appointment[];
  containers: Container[];
  icons: {
    Users: LucideIcon;
    Calendar: LucideIcon;
    Container: LucideIcon;
  };
}) {
  const { clientes, agendamentos, containers, icons } = params;

  const atividades: AtividadeRecente[] = [];

  clientes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
    .forEach((c) => {
      const dataCadastro = new Date(c.createdAt);
      if (Number.isNaN(dataCadastro.getTime())) return;
      atividades.push({
        id: `cliente-${c.id}`,
        tipo: "cliente",
        descricao: `Novo cliente cadastrado: ${c.usaName}`,
        data: dataCadastro,
        icone: icons.Users,
        color: "blue",
      });
    });

  [...agendamentos]
    .sort((a, b) => {
      const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return tb - ta;
    })
    .slice(0, 2)
    .forEach((a) => {
      atividades.push({
        id: `agendamento-${a.id ?? ""}`,
        tipo: "agendamento",
        descricao: descricaoAtividadeAgendamento(a),
        data: dataAtividadeAgendamento(a),
        icone: icons.Calendar,
        color: "green",
      });
    });

  containers.slice(0, 2).forEach((c) => {
    const dataEmbarque = new Date((c as any).boardingDate || "");
    if (Number.isNaN(dataEmbarque.getTime())) return;
    atividades.push({
      id: `container-${(c as any).id}`,
      tipo: "container",
      descricao: `Container ${(c as any).number} - ${
        (c as any).status === "PREPARATION"
          ? "Em Preparação"
          : (c as any).status === "IN_TRANSIT"
            ? "Em Trânsito"
            : (c as any).status === "DELIVERED"
              ? "Entregue"
              : (c as any).status === "CANCELLED"
                ? "Cancelado"
                : ""
      }`,
      data: dataEmbarque,
      icone: icons.Container,
      color: "purple",
    });
  });

  return atividades.sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, 5);
}

export function formatDateTimePtBR(date: Date) {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatCurrencyCompactUSD(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

