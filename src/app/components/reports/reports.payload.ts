import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Appointment, Client, Container, FinancialTransaction } from "../../api";

export type EstatisticasGerais = {
  totalClientes: number;
  totalAgendamentos: number;
  totalContainers: number;
  totalTransacoes: number;
  receitas: number;
  despesas: number;
  lucro: number;
  margemLucro: string | number;
  containersPreparacao: number;
  containersTransito: number;
  containersEntregue: number;
  agendamentosConfirmados: number;
  agendamentosPendentes: number;
  agendamentosConcluidos: number;
  ticketMedio: number;
  crescimentoMensal: number;
};

export type ClientePorEstado = { estado: string; quantidade: number };
export type ReceitaMensal = { mes: string; valor: number };

export type PerformanceAtendente = {
  nome: string;
  clientes: number;
  receitas: number;
  ticketMedio: number;
};

export type CategoriaDespesa = { categoria: string; valor: number };

export function buildEstatisticasGerais(params: {
  clientes: Client[];
  containers: Container[];
  agendamentos: Appointment[];
  transacoes: FinancialTransaction[];
}): EstatisticasGerais {
  const { clientes, containers, agendamentos, transacoes } = params;

  const totalClientes = clientes.length;
  const totalAgendamentos = agendamentos.length;
  const totalContainers = containers.length;
  const totalTransacoes = transacoes.length;

  const receitas = transacoes.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0);
  const despesas = transacoes.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0);
  const lucro = receitas - despesas;
  const margemLucro = receitas > 0 ? ((lucro / receitas) * 100).toFixed(1) : "0";

  const containersPreparacao = containers.filter((c) => c.status === "PREPARATION").length;
  const containersTransito = containers.filter((c) => c.status === "IN_TRANSIT").length;
  const containersEntregue = containers.filter((c) => c.status === "DELIVERED").length;

  const agendamentosConfirmados = agendamentos.filter((a) => a.status === "CONFIRMED").length;
  const agendamentosPendentes = agendamentos.filter((a) => a.status === "PENDING").length;
  const agendamentosConcluidos = agendamentos.filter((a) => a.status === "COLLECTED").length;

  const ticketMedio = totalClientes > 0 ? receitas / totalClientes : 0;

  // Mantém comportamento do componente original (simulado)
  const crescimentoMensal = 12.5;

  return {
    totalClientes,
    totalAgendamentos,
    totalContainers,
    totalTransacoes,
    receitas,
    despesas,
    lucro,
    margemLucro,
    containersPreparacao,
    containersTransito,
    containersEntregue,
    agendamentosConfirmados,
    agendamentosPendentes,
    agendamentosConcluidos,
    ticketMedio,
    crescimentoMensal,
  };
}

export function buildClientesPorEstado(clientes: Client[]): ClientePorEstado[] {
  const estados: Record<string, number> = {};
  clientes.forEach((c) => {
    const estado = c.usaAddress.estado as string;
    estados[estado] = (estados[estado] || 0) + 1;
  });

  return Object.entries(estados)
    .map(([estado, quantidade]) => ({ estado, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
}

export function buildReceitasMensais(transacoes: FinancialTransaction[]): ReceitaMensal[] {
  const meses: Record<string, number> = {};
  transacoes
    .filter((t) => t.tipo === "receita")
    .forEach((t) => {
      const data = new Date(t.data);
      const mesAno = format(data, "MMM/yy", { locale: ptBR });
      meses[mesAno] = (meses[mesAno] || 0) + t.valor;
    });

  return Object.entries(meses)
    .map(([mes, valor]) => ({ mes, valor }))
    .slice(-6);
}

export function buildPerformanceAtendentes(params: { clientes: Client[]; transacoes: FinancialTransaction[] }): PerformanceAtendente[] {
  const { clientes, transacoes } = params;

  const atendentes: Record<string, { clientes: number; receitas: number }> = {};

  clientes.forEach((c) => {
    const key = c.user?.id ?? "";
    if (!key) return;
    if (!atendentes[key]) {
      atendentes[key] = { clientes: 0, receitas: 0 };
    }
    atendentes[key].clientes += 1;

    const receitasCliente = transacoes
      .filter((t) => t.clienteId === c.id && t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor, 0);

    atendentes[key].receitas += receitasCliente;
  });

  const userNames = new Map(clientes.map((c) => [c.user?.id ?? "", c.user?.name ?? c.user?.id ?? "—"]));

  return Object.entries(atendentes)
    .map(([userId, dados]) => ({
      nome: userNames.get(userId) ?? userId,
      clientes: dados.clientes,
      receitas: dados.receitas,
      ticketMedio: dados.clientes > 0 ? dados.receitas / dados.clientes : 0,
    }))
    .sort((a, b) => b.receitas - a.receitas);
}

export function buildCategoriasDespesas(transacoes: FinancialTransaction[]): CategoriaDespesa[] {
  const categorias: Record<string, number> = {};

  transacoes
    .filter((t) => t.tipo === "despesa")
    .forEach((t) => {
      categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
    });

  return Object.entries(categorias)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);
}

