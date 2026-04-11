import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Client, FinancialTransaction } from "../api";
import { handleDeleteTransaction } from "./financial/financial.handlers";
import {
  buildFluxoCaixaMensal,
  buildPagamentoReceitaDespesa,
  computeFinanceiroTotals,
  filterTransacoes,
  groupTransacoesByCategoria,
} from "./financial/financial.utils";
import type { PeriodFilter, ViewMode } from "./financial/financial.constants";
import { FinancialHeaderSection } from "./financial/components/FinancialHeaderSection";
import { FinancialMetricsCards } from "./financial/components/FinancialMetricsCards";
import { FinancialFiltersAndSearchBar } from "./financial/components/FinancialFiltersAndSearchBar";
import { FinancialChartsSection } from "./financial/components/FinancialChartsSection";
import { FinancialTransactionsHistory } from "./financial/components/transactions-history/FinancialTransactionsHistory";
import { clientsCrud } from "./financial/index";
import { toast } from "sonner";
import { financialTransactionCrud } from "./financial/index";
import { ConfirmAlertDialog } from "./ui/confirm-alert-dialog";

export default function FinanceiroView() {
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>([]);
  const [deleteTransacaoId, setDeleteTransacaoId] = useState<string | null>(null);
  const [deleteTransacaoLoading, setDeleteTransacaoLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("todas");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("mes");

  const carregarTransacoesFinanceiras = useCallback(async () => {
    const result = await financialTransactionCrud.getAll();
    if (result.success && result.data) {
      setTransacoes(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
  }, []);

  const criarTransacao = useCallback(async (payload: FinancialTransaction) => {
    const result = await financialTransactionCrud.create(payload);
    if (!result.success || !result.data) {
      if (result.error) toast.error(result.error);
      return false;
    }
    const created = result.data;
    setTransacoes((prev) => [...prev, created]);
    return true;
  }, []);

  const excluirTransacao = useCallback(async (id: string) => {
    const result = await financialTransactionCrud.delete(id);
    if (!result.success) {
      if (result.error) toast.error(result.error);
      return false;
    }
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  useEffect(() => {
    carregarTransacoesFinanceiras();
  }, [carregarTransacoesFinanceiras]);

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

  /** Período global (barra superior); histórico tem busca e abas próprias. */
  const transacoesHistoricoPeriodo = useMemo(
    () =>
      filterTransacoes({
        transacoes,
        viewMode: "todas",
        periodFilter,
        searchTerm: "",
      }),
    [transacoes, periodFilter],
  );

  const carregarClientes = useCallback(async (): Promise<Client[]> => {
    const result = await clientsCrud.getAll();
    if (result.success && result.data) {
      return result.data.filter((c) => c.status === "ACTIVE");
    }
    if (result.error) {
      toast.error(result.error);
    }
    return [];
  }, []);

  const totals = useMemo(() => computeFinanceiroTotals(filteredTransacoes), [filteredTransacoes]);

  const confirmDeleteTransacao = async () => {
    if (!deleteTransacaoId) return;
    setDeleteTransacaoLoading(true);
    try {
      await handleDeleteTransaction({
        id: deleteTransacaoId,
        deleteTransacao: excluirTransacao,
      });
      setDeleteTransacaoId(null);
    } finally {
      setDeleteTransacaoLoading(false);
    }
  };

  const receitasPorCategoria = useMemo(
    () => groupTransacoesByCategoria({ transacoes: totals.receitas, color: "#10B981" }),
    [totals.receitas],
  );
  const despesasPorCategoria = useMemo(
    () => groupTransacoesByCategoria({ transacoes: totals.despesas, color: "#EF4444" }),
    [totals.despesas],
  );

  const fluxoCaixaMensal = useMemo(() => buildFluxoCaixaMensal(filteredTransacoes), [filteredTransacoes]);

  const pagamentoReceitaDespesa = useMemo(
    () => buildPagamentoReceitaDespesa(filteredTransacoes),
    [filteredTransacoes],
  );

  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
      <FinancialHeaderSection
        showFilters={showFilters}
        carregarClientes={carregarClientes}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onCreateTransacao={criarTransacao}
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
        pagamentoReceitaDespesa={pagamentoReceitaDespesa}
        receitasCount={totals.receitas.length}
        despesasCount={totals.despesas.length}
      />

      <FinancialTransactionsHistory
        transacoes={transacoesHistoricoPeriodo}
        onDelete={(id) => setDeleteTransacaoId(id)}
      />

      <ConfirmAlertDialog
        open={Boolean(deleteTransacaoId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTransacaoId(null);
        }}
        title="Excluir transação?"
        description={
          <>
            <p>Tem certeza que deseja excluir esta transação?</p>
            <p className="text-xs">Esta ação não pode ser desfeita.</p>
          </>
        }
        confirmLabel="Excluir"
        tone="destructive"
        loading={deleteTransacaoLoading}
        onConfirm={confirmDeleteTransacao}
      />
    </div>
  );
}

