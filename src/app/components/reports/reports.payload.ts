import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Appointment, Client, Container, FinancialTransaction } from "../../api";
import { parseApiDateToLocalDate } from "../../utils/date";

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
  containersEnviado: number;
  containersTransito: number;
  containersEntregue: number;
  containersCancelados: number;
  agendamentosConfirmados: number;
  agendamentosPendentes: number;
  agendamentosConcluidos: number;
  ticketMedio: number;
  /** Variação % das receitas (REVENUE): mês civil atual vs. mês anterior, a partir das transações da API. */
  crescimentoMensal: number;
  /** Agendamentos concluídos / total de agendamentos (%), uma casa decimal. */
  taxaConversaoAgendamentos: number;
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

/** Por categoria: totais de receita e despesa (para gráficos comparativos). */
export type CategoriaReceitaDespesa = { categoria: string; receitas: number; despesas: number };

function yearMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Crescimento % das receitas: soma REVENUE no mês calendário atual vs. mês anterior.
 * Base local (parseApiDateToLocalDate). Sem receitas no mês anterior e com receitas no atual → 100.
 */
export function computeCrescimentoReceitasMesVsMesAnterior(transacoes: FinancialTransaction[]): number {
  const hoje = new Date();
  const mesAtual = yearMonthKey(hoje);
  const mesAnteriorDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const mesAnterior = yearMonthKey(mesAnteriorDate);

  let receitaMesAtual = 0;
  let receitaMesAnterior = 0;

  for (const t of transacoes) {
    if (t.type !== "REVENUE") continue;
    const dt = parseApiDateToLocalDate(t.date);
    if (!isValid(dt)) continue;
    const key = yearMonthKey(dt);
    const v = Number(t.value) || 0;
    if (key === mesAtual) receitaMesAtual += v;
    else if (key === mesAnterior) receitaMesAnterior += v;
  }

  if (receitaMesAnterior === 0) {
    if (receitaMesAtual === 0) return 0;
    return 100;
  }

  const pct = ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100;
  return Math.round(pct * 10) / 10;
}

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

  const receitas = transacoes.filter((t) => t.type === "REVENUE").reduce((sum, t) => sum + t.value, 0);
  const despesas = transacoes.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.value, 0);
  const lucro = receitas - despesas;
  const margemLucro = receitas > 0 ? ((lucro / receitas) * 100).toFixed(1) : "0";

  const containersPreparacao = containers.filter((c) => c.status === "PREPARATION").length;
  const containersEnviado = containers.filter((c) => c.status === "SHIPPED").length;
  const containersTransito = containers.filter((c) => c.status === "IN_TRANSIT").length;
  const containersEntregue = containers.filter((c) => c.status === "DELIVERED").length;
  const containersCancelados = containers.filter((c) => c.status === "CANCELLED").length;

  const agendamentosConfirmados = agendamentos.filter((a) => a.status === "CONFIRMED").length;
  const agendamentosPendentes = agendamentos.filter((a) => a.status === "PENDING").length;
  const agendamentosConcluidos = agendamentos.filter((a) => a.status === "COLLECTED").length;

  const ticketMedio = totalClientes > 0 ? receitas / totalClientes : 0;

  const crescimentoMensal = computeCrescimentoReceitasMesVsMesAnterior(transacoes);
  const taxaConversaoAgendamentos =
    totalAgendamentos > 0 ? Math.round((agendamentosConcluidos / totalAgendamentos) * 1000) / 10 : 0;

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
    containersEnviado,
    containersTransito,
    containersEntregue,
    containersCancelados,
    agendamentosConfirmados,
    agendamentosPendentes,
    agendamentosConcluidos,
    ticketMedio,
    crescimentoMensal,
    taxaConversaoAgendamentos,
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
    .filter((t) => t.type === "REVENUE")
    .forEach((t) => {
      const data = new Date(t.date);
      const mesAno = format(data, "MMM/yy", { locale: ptBR });
      meses[mesAno] = (meses[mesAno] || 0) + t.value;
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
      .filter((t) => t.clientId === c.id && t.type === "REVENUE")
      .reduce((sum, t) => sum + t.value, 0);

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
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const cat = (t.category ?? "—") as string;
      categorias[cat] = (categorias[cat] || 0) + (Number(t.value) || 0);
    });

  return Object.entries(categorias)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);
}

export function buildCategoriasReceitaDespesa(transacoes: FinancialTransaction[]): CategoriaReceitaDespesa[] {
  const map = new Map<string, { receitas: number; despesas: number }>();

  for (const t of transacoes) {
    const cat = (t.category ?? "—") as string;
    if (!map.has(cat)) map.set(cat, { receitas: 0, despesas: 0 });
    const acc = map.get(cat)!;
    const v = Number(t.value) || 0;
    if (t.type === "REVENUE") acc.receitas += v;
    else acc.despesas += v;
  }

  return [...map.entries()]
    .map(([categoria, v]) => ({ categoria, receitas: v.receitas, despesas: v.despesas }))
    .sort((a, b) => b.receitas + b.despesas - (a.receitas + a.despesas));
}

