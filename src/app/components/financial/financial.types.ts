import type { Transacao } from "../../api";
import type { ViewMode, PeriodFilter } from "./financial.constants";

export type TipoTransacao = Transacao["tipo"];

export type TransactionFormData = {
  clienteId: string;
  tipo: TipoTransacao;
  categoria: string;
  valor: string;
  data: string;
  descricao: string;
  metodoPagamento: string;
};

export type FinancialViewState = {
  searchTerm: string;
  viewMode: ViewMode;
  periodFilter: PeriodFilter;
  showFilters: boolean;
};

