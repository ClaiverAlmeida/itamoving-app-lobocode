import type { FinancialTransaction } from "../../api";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { parseApiDateToLocalDate } from "../../utils/date";
import type { PeriodFilter, ViewMode } from "./index";

export type FinanceiroTotals = {
  receitas: FinancialTransaction[];
  despesas: FinancialTransaction[];
  totalReceitas: number;
  totalDespesas: number;
  lucro: number;
  margemLucro: string | number;
  ticketMedio: number;
};

export type PieCategoriaPoint = { name: string; value: number; color?: string };

export type LineFluxoCaixaPoint = { mes: string; receitas: number; despesas: number; lucro: number };

/** Receitas e despesas agregadas por método de pagamento (filtros da tela aplicados). */
export type PagamentoReceitaDespesaPoint = { metodo: string; receitas: number; despesas: number };

export function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function filterTransacoes(params: {
  transacoes: FinancialTransaction[];
  viewMode: ViewMode;
  periodFilter: PeriodFilter;
  searchTerm: string;
}) {
  const { transacoes, viewMode, periodFilter, searchTerm } = params;

  let filtered = transacoes;

  if (viewMode === "receitas") filtered = filtered.filter((t) => t.type === "REVENUE");
  if (viewMode === "despesas") filtered = filtered.filter((t) => t.type === "EXPENSE");

  if (periodFilter !== "todos") {
    const now = new Date();
    filtered = filtered.filter((t) => {
      const transactionDate = parseApiDateToLocalDate(t.date);
      if (!isValid(transactionDate)) return false;
      const diffTime = now.getTime() - transactionDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (periodFilter === "mes") return diffDays <= 30;
      if (periodFilter === "trimestre") return diffDays <= 90;
      if (periodFilter === "ano") return diffDays <= 365;
      return true;
    });
  }

  if (searchTerm) {
    filtered = filterTransacoesBySearch(filtered, searchTerm);
  }

  return filtered;
}

export function filterTransacoesBySearch(transacoes: FinancialTransaction[], searchTerm: string): FinancialTransaction[] {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return transacoes;
  return transacoes.filter(
    (t) =>
      (t.description ?? "").toLowerCase().includes(q) ||
      (t.category ?? "").toLowerCase().includes(q) ||
      (t.clientName ?? "").toLowerCase().includes(q) ||
      (t.paymentMethod ?? "").toLowerCase().includes(q),
  );
}

/** Mais recente primeiro (data desc); desempate por id. */
export function sortFinancialTransactionsNewestFirst(transacoes: FinancialTransaction[]): FinancialTransaction[] {
  return [...transacoes].sort((a, b) => {
    const da = parseApiDateToLocalDate(a.date);
    const db = parseApiDateToLocalDate(b.date);
    const validA = isValid(da);
    const validB = isValid(db);
    if (validA && validB) {
      const diff = db.getTime() - da.getTime();
      if (diff !== 0) return diff;
    } else if (validB !== validA) {
      return validB ? 1 : -1;
    }
    return (b.id ?? "").localeCompare(a.id ?? "");
  });
}

export function computeFinanceiroTotals(filteredTransacoes: FinancialTransaction[]): FinanceiroTotals {
  const receitas = filteredTransacoes.filter((t) => t.type === "REVENUE");
  const despesas = filteredTransacoes.filter((t) => t.type === "EXPENSE");
  const totalReceitas = receitas.reduce((sum, t) => sum + t.value, 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + t.value, 0);
  const lucro = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucro / totalReceitas) * 100).toFixed(1) : 0;
  const ticketMedio = receitas.length > 0 ? totalReceitas / receitas.length : 0;

  return { receitas, despesas, totalReceitas, totalDespesas, lucro, margemLucro, ticketMedio };
}

export function groupTransacoesByCategoria(params: { transacoes: FinancialTransaction[]; color: string }) {
  const { transacoes, color } = params;
  const categorias: Record<string, number> = {};
  transacoes.forEach((t) => {
    categorias[t.category] = (categorias[t.category] || 0) + t.value;
  });

  return Object.entries(categorias).map(([name, value]) => ({
    name,
    value,
    color,
  })) as PieCategoriaPoint[];
}

export function buildPagamentoReceitaDespesa(transacoes: FinancialTransaction[]): PagamentoReceitaDespesaPoint[] {
  const map = new Map<string, { receitas: number; despesas: number }>();

  for (const t of transacoes) {
    const metodo = String(t.paymentMethod ?? "—").trim() || "—";
    if (!map.has(metodo)) map.set(metodo, { receitas: 0, despesas: 0 });
    const acc = map.get(metodo)!;
    const v = Number(t.value) || 0;
    if (t.type === "REVENUE") acc.receitas += v;
    else acc.despesas += v;
  }

  return [...map.entries()]
    .map(([metodo, v]) => ({ metodo, receitas: v.receitas, despesas: v.despesas }))
    .sort((a, b) => b.receitas + b.despesas - (a.receitas + a.despesas));
}

export function buildFluxoCaixaMensal(filteredTransacoes: FinancialTransaction[]): LineFluxoCaixaPoint[] {
  const meses: Record<string, { receitas: number; despesas: number; lucro: number }> = {};

  filteredTransacoes.forEach((t) => {
    const data = parseApiDateToLocalDate(t.date);
    if (!isValid(data)) return;
    const mesAno = format(data, "MMM/yy", { locale: ptBR });

    if (!meses[mesAno]) meses[mesAno] = { receitas: 0, despesas: 0, lucro: 0 };
    if (t.type === "REVENUE") meses[mesAno].receitas += t.value;
    else meses[mesAno].despesas += t.value;

    meses[mesAno].lucro = meses[mesAno].receitas - meses[mesAno].despesas;
  });

  return Object.entries(meses)
    .map(([mes, valores]) => ({ mes, ...valores }))
    .slice(-6);
}

