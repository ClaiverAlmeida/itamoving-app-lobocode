import type { Agendamento, Cliente, Container, Estoque } from "../../api";
import { isPast, isToday, isTomorrow } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { ALARTE_COLOR_MAP, type Alerta, type AtividadeRecente } from "./dashboard.constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export type FinanceiroDataPoint = { mes: string; receitas: number; despesas: number; lucro: number };
export type ContainerStatusDataPoint = { name: string; value: number; color: string };
export type EstoqueDataPoint = { tipo: string; quantidade: number; fill: string };
export type PerformanceDataPoint = { dia: string; clientes: number; agendamentos: number; containers: number };

export function getAgendamentosCounts(agendamentos: Agendamento[]) {
  const hoje = new Date().toISOString().split("T")[0];
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const agendamentosHoje = agendamentos.filter((a) => a.collectionDate === hoje).length;
  const agendamentosAmanha = agendamentos.filter((a) => a.collectionDate === amanha).length;
  const agendamentosPendentes = agendamentos.filter((a) => a.status === "PENDING").length;
  return { agendamentosHoje, agendamentosAmanha, agendamentosPendentes };
}

export function getFinanceiroTotals(transacoes: { tipo: string; valor: number }[]) {
  const receitaTotal = transacoes.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0);
  const despesaTotal = transacoes.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0);
  const lucro = receitaTotal - despesaTotal;
  const margemLucro = receitaTotal > 0 ? ((lucro / receitaTotal) * 100).toFixed(1) : "0";
  return { receitaTotal, despesaTotal, lucro, margemLucro };
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

export function buildFinanceiroData(receitaTotal: number, despesaTotal: number, lucro: number): FinanceiroDataPoint[] {
  // Mantém o mesmo array original do dashboard (valores mockados + últimos pontos com total real).
  return [
    { mes: "Jul", receitas: 45000, despesas: 28000, lucro: 17000 },
    { mes: "Ago", receitas: 52000, despesas: 31000, lucro: 21000 },
    { mes: "Set", receitas: 48000, despesas: 29000, lucro: 19000 },
    { mes: "Out", receitas: 61000, despesas: 35000, lucro: 26000 },
    { mes: "Nov", receitas: 58000, despesas: 33000, lucro: 25000 },
    { mes: "Dez", receitas: receitaTotal, despesas: despesaTotal, lucro: lucro },
  ];
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

export function buildPerformanceData(): PerformanceDataPoint[] {
  return [
    { dia: "Seg", clientes: 5, agendamentos: 8, containers: 2 },
    { dia: "Ter", clientes: 7, agendamentos: 6, containers: 3 },
    { dia: "Qua", clientes: 4, agendamentos: 10, containers: 1 },
    { dia: "Qui", clientes: 6, agendamentos: 7, containers: 2 },
    { dia: "Sex", clientes: 8, agendamentos: 9, containers: 4 },
    { dia: "Sáb", clientes: 3, agendamentos: 4, containers: 1 },
    { dia: "Dom", clientes: 2, agendamentos: 2, containers: 0 },
  ];
}

export function getAlertaColor(tipo: Alerta["tipo"]) {
  return ALARTE_COLOR_MAP[tipo];
}

export function buildAlertas(params: {
  agendamentos: Agendamento[];
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
  clientes: Cliente[];
  agendamentos: Agendamento[];
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
    .sort((a, b) => new Date((b as any).dataCadastro).getTime() - new Date((a as any).dataCadastro).getTime())
    .slice(0, 2)
    .forEach((c) => {
      const dataCadastro = new Date((c as any).dataCadastro);
      if (Number.isNaN(dataCadastro.getTime())) return;
      atividades.push({
        id: `cliente-${(c as any).id}`,
        tipo: "cliente",
        descricao: `Novo cliente cadastrado: ${(c as any).usaNome}`,
        data: dataCadastro,
        icone: icons.Users,
        color: "blue",
      });
    });

  agendamentos.slice(0, 2).forEach((a) => {
    atividades.push({
      id: `agendamento-${(a as any).id}`,
      tipo: "agendamento",
      descricao: `Agendamento criado para ${(a as any).client?.name}`,
      data: new Date(),
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

