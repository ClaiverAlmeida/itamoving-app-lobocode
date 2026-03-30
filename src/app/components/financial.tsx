import React, { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import type { Client, FinancialTransaction } from "../api";
import { createFinancialCrud, financialCrud } from "./financial/financial.crud";
import { handleDeleteTransaction } from "./financial/financial.handlers";
import { buildFluxoCaixaMensal, computeFinanceiroTotals, filterTransacoes, groupTransacoesByCategoria } from "./financial/financial.utils";
import type { PeriodFilter, ViewMode } from "./financial/financial.constants";
import { FinancialHeaderSection } from "./financial/components/FinancialHeaderSection";
import { FinancialMetricsCards } from "./financial/components/FinancialMetricsCards";
import { FinancialFiltersAndSearchBar } from "./financial/components/FinancialFiltersAndSearchBar";
import { FinancialChartsSection } from "./financial/components/FinancialChartsSection";
import { FinancialTransactionsHistory } from "./financial/components/FinancialTransactionsHistory";
import { clientsCrud } from "./financial/index";
import { toast } from "sonner";

export default function FinanceiroView() {
  const { transacoes, addTransacao, deleteTransacao } = useData();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("todas");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("mes");

  const crud = useMemo(
    () =>
      createFinancialCrud({
        addTransacao: (t: FinancialTransaction) => addTransacao(t),
        deleteTransacao: (id: string) => deleteTransacao(id),
      }),
    [addTransacao, deleteTransacao],
  );

  const filteredTransacoes = useMemo(
    () =>
      filterTransacoes({
        transacoes,
        viewMode,
        periodFilter,
        searchTerm,
      }),
    [transacoes, viewMode, periodFilter, searchTerm],
  );

  const carregarClientes = async ():Promise<Client[]> => {
    const result = await clientsCrud.getAll();
    if (result.success && result.data) {
      return result.data.filter((c) => c.status === "ACTIVE");
    } else if (result.error) {
      toast.error(result.error);
    }
    return [];
  };

  const totals = useMemo(() => computeFinanceiroTotals(filteredTransacoes), [filteredTransacoes]);

  const receitasPorCategoria = useMemo(
    () => groupTransacoesByCategoria({ transacoes: totals.receitas, color: "#10B981" }),
    [totals.receitas],
  );
  const despesasPorCategoria = useMemo(
    () => groupTransacoesByCategoria({ transacoes: totals.despesas, color: "#EF4444" }),
    [totals.despesas],
  );

  const fluxoCaixaMensal = useMemo(() => buildFluxoCaixaMensal(filteredTransacoes), [filteredTransacoes]);

  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
      <FinancialHeaderSection
        showFilters={showFilters}
        carregarClientes={carregarClientes}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onCreateTransacao={crud.create}
      />

      <FinancialMetricsCards totals={totals} filteredCount={filteredTransacoes.length} />

      <FinancialFiltersAndSearchBar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
        periodFilter={periodFilter}
        onPeriodFilterChange={(value) => setPeriodFilter(value)}
      />

      <FinancialChartsSection
        fluxoCaixaMensal={fluxoCaixaMensal}
        receitasPorCategoria={receitasPorCategoria}
        despesasPorCategoria={despesasPorCategoria}
        receitasCount={totals.receitas.length}
        despesasCount={totals.despesas.length}
      />

      <FinancialTransactionsHistory
        filteredTransacoes={filteredTransacoes}
        onDelete={(id) => handleDeleteTransaction({ id, deleteTransacao: crud.remove })}
      />
    </div>
  );
}

