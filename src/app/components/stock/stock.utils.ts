import type { EstoqueMovimentacao, ProductType, StockItemConfig, StockStatistics } from "./stock.types";
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "./stock.constants";
import { getAppTimeZone } from "../../utils";

export function getMovItemKey(mov: EstoqueMovimentacao) {
  return PRODUCT_TYPE_TO_ITEM_KEY[mov.product.type as ProductType];
}

export function getMovQuantity(mov: EstoqueMovimentacao) {
  return mov.quantity ?? 0;
}

export function normalizeField(value: string) {
  if (!value) return "";
  return (
    value.charAt(0).replace(/[^a-zA-ZÀ-ÿ\s]/g, "").toUpperCase() +
    value.slice(1).replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
  );
}

export function getNivelEstoque(quantidade: number, minimo: number, ideal: number) {
  if (quantidade < minimo) return { nivel: "critico", label: "Crítico", color: "red" } as const;
  if (quantidade < minimo * 1.5) return { nivel: "baixo", label: "Baixo", color: "yellow" } as const;
  if (quantidade < ideal) return { nivel: "medio", label: "Médio", color: "blue" } as const;
  return { nivel: "ideal", label: "Ideal", color: "green" } as const;
}

export function filterMovimentacoes(movimentacoes: EstoqueMovimentacao[], searchTerm: string) {
  const sorted = [...movimentacoes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (!searchTerm.trim()) return sorted;

  const term = searchTerm.trim().toLowerCase();
  const typeStr = (t: string) => (t === "ENTRY" ? "entrada" : "saída");
  const dateStr = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { timeZone: getAppTimeZone() }) +
    " " +
    new Date(d).toLocaleTimeString("pt-BR", {
      timeZone: getAppTimeZone(),
      hour: "2-digit",
      minute: "2-digit",
    });

  return sorted.filter((mov) => {
    const itemKey = PRODUCT_TYPE_TO_ITEM_KEY[mov.product.type as ProductType];
    const productType = ITEM_LABELS[itemKey] ?? "";
    const type = typeStr(mov.type);
    const date = dateStr(mov.createdAt);
    const qty = String(mov.quantity);
    const resp = (mov.user.name ?? "").toLowerCase();
    const obs = (mov.observations ?? "").toLowerCase();
    const product = (mov.product.name ?? "").toLowerCase();
    return (
      productType.toLowerCase().includes(term) ||
      type.includes(term) ||
      date.toLowerCase().includes(term) ||
      qty.includes(term) ||
      resp.includes(term) ||
      obs.includes(term) ||
      product.includes(term)
    );
  });
}

export function buildStatistics(
  estoque: Record<string, number>,
  items: StockItemConfig[],
  movimentacoes: EstoqueMovimentacao[],
): StockStatistics {
  const totalItens = Object.values(estoque).reduce((sum, val) => sum + Number(val ?? 0), 0);
  const itensCriticos = items.filter((item) => Number(estoque[item.key] ?? 0) < item.minimo).length;
  const itensOk = items.filter((item) => Number(estoque[item.key] ?? 0) >= item.ideal).length;

  const entradas7dias = movimentacoes
    .filter((m) => m.type === "ENTRY" && Date.now() - new Date(m.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, m) => sum + getMovQuantity(m), 0);

  const saidas7dias = movimentacoes
    .filter((m) => m.type === "EXIT" && Date.now() - new Date(m.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, m) => sum + getMovQuantity(m), 0);

  return { totalItens, itensCriticos, itensOk, entradas7dias, saidas7dias };
}

function getColorHex(cor: StockItemConfig["cor"]) {
  if (cor === "red") return "#EF4444";
  if (cor === "green") return "#10B981";
  if (cor === "orange") return "#F59E0B";
  if (cor === "purple") return "#A855F7";
  return "#5DADE2";
}

export function buildStockChartsData(items: StockItemConfig[], estoque: Record<string, number>) {
  const chartData = items.map((item) => ({
    nome: item.nome.replace("Caixas ", "").replace("Fitas Adesivas", "Fitas"),
    atual: estoque[item.key],
    minimo: item.minimo,
    ideal: item.ideal,
    fill: getColorHex(item.cor),
  }));

  const distribuicaoData = items.map((item) => ({
    name: item.nome.replace("Caixas ", "").replace("Fitas Adesivas", "Fitas"),
    value: estoque[item.key],
    color: getColorHex(item.cor),
  }));

  return { chartData, distribuicaoData };
}

