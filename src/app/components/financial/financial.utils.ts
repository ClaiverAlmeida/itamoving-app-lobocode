import type { Transacao } from "../../api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { PeriodFilter, ViewMode } from "./financial.constants";

export type FinanceiroTotals = {
  receitas: Transacao[];
  despesas: Transacao[];
  totalReceitas: number;
  totalDespesas: number;
  lucro: number;
  margemLucro: string | number;
  ticketMedio: number;
};

export type PieCategoriaPoint = { name: string; value: number; color?: string };

export type LineFluxoCaixaPoint = { mes: string; receitas: number; despesas: number; lucro: number };

export function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function filterTransacoes(params: {
  transacoes: Transacao[];
  viewMode: ViewMode;
  periodFilter: PeriodFilter;
  searchTerm: string;
}) {
  const { transacoes, viewMode, periodFilter, searchTerm } = params;

  let filtered = transacoes;

  if (viewMode === "receitas") filtered = filtered.filter((t) => t.tipo === "receita");
  if (viewMode === "despesas") filtered = filtered.filter((t) => t.tipo === "despesa");

  if (periodFilter !== "todos") {
    const now = new Date();
    filtered = filtered.filter((t) => {
      const transactionDate = new Date(t.data);
      const diffTime = now.getTime() - transactionDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (periodFilter === "mes") return diffDays <= 30;
      if (periodFilter === "trimestre") return diffDays <= 90;
      if (periodFilter === "ano") return diffDays <= 365;
      return true;
    });
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.descricao.toLowerCase().includes(term) ||
        t.categoria.toLowerCase().includes(term) ||
        t.clienteNome.toLowerCase().includes(term),
    );
  }

  return filtered;
}

export function computeFinanceiroTotals(filteredTransacoes: Transacao[]): FinanceiroTotals {
  const receitas = filteredTransacoes.filter((t) => t.tipo === "receita");
  const despesas = filteredTransacoes.filter((t) => t.tipo === "despesa");
  const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
  const lucro = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucro / totalReceitas) * 100).toFixed(1) : 0;
  const ticketMedio = receitas.length > 0 ? totalReceitas / receitas.length : 0;

  return { receitas, despesas, totalReceitas, totalDespesas, lucro, margemLucro, ticketMedio };
}

export function groupTransacoesByCategoria(params: { transacoes: Transacao[]; color: string }) {
  const { transacoes, color } = params;
  const categorias: Record<string, number> = {};
  transacoes.forEach((t) => {
    categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
  });

  return Object.entries(categorias).map(([name, value]) => ({
    name,
    value,
    color,
  })) as PieCategoriaPoint[];
}

export function buildFluxoCaixaMensal(filteredTransacoes: Transacao[]): LineFluxoCaixaPoint[] {
  const meses: Record<string, { receitas: number; despesas: number; lucro: number }> = {};

  filteredTransacoes.forEach((t) => {
    const data = new Date(t.data);
    const mesAno = format(data, "MMM/yy", { locale: ptBR });

    if (!meses[mesAno]) meses[mesAno] = { receitas: 0, despesas: 0, lucro: 0 };
    if (t.tipo === "receita") meses[mesAno].receitas += t.valor;
    else meses[mesAno].despesas += t.valor;

    meses[mesAno].lucro = meses[mesAno].receitas - meses[mesAno].despesas;
  });

  return Object.entries(meses)
    .map(([mes, valores]) => ({ mes, ...valores }))
    .slice(-6);
}

