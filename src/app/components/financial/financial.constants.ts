export type ViewMode = "todas" | "receitas" | "despesas";
export type PeriodFilter = "todos" | "mes" | "trimestre" | "ano";

export const CATEGORIAS_RECEITA = [
  "Serviço de Mudança",
  "Container Compartilhado",
  "Container Exclusivo",
  "Embalagem",
  "Seguro",
  "Outros",
] as const;

export const CATEGORIAS_DESPESA = [
  "Transporte",
  "Combustível",
  "Manutenção",
  "Salários",
  "Aluguel",
  "Material de Embalagem",
  "Marketing",
  "Outros",
] as const;

export const METODOS_PAGAMENTO = [
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência Bancária",
  "PIX",
  "Dinheiro",
  "Cheque",
] as const;

