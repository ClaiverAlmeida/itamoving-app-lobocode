import type { FinancialTransaction } from "../../api";
import type { ViewMode, PeriodFilter } from "./index";

export type TransactionFormData = {
  clientId: string;
  type: FinancialTransaction["type"];
  category: string;
  value: string;
  date: string;
  description: string;
  paymentMethod: string;
};

export type FinancialViewState = {
  searchTerm: string;
  viewMode: ViewMode;
  periodFilter: PeriodFilter;
  showFilters: boolean;
};

