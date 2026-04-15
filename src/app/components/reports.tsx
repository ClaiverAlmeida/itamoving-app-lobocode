import React, { useMemo, useState } from "react";
import { useDashboardData, type DashboardDataConfig } from "../hooks/useDashboardData";
import { ESTOQUE_IDEAL, ESTOQUE_MINIMO } from "./stock";
import type { ReportType } from "./reports/reports.constants";
import { REPORT_TYPES } from "./reports/reports.constants";
import {
  filterAgendamentosByDateRange,
  filterClientesByDateRange,
  filterContainersByDateRange,
  filterTransacoesByDateRange,
} from "./reports/reports.filter";
import { filterClientesBySearch, formatCurrencyUSD } from "./reports/reports.utils";
import {
  buildCategoriasReceitaDespesa,
  buildClientesPorEstado,
  buildEstatisticasGerais,
  buildPerformanceAtendentes,
  buildReceitasMensais,
  type CategoriaReceitaDespesa,
  type EstatisticasGerais,
  type PerformanceAtendente,
} from "./reports/reports.payload";

import { ReportsHeaderSection } from "./reports/components/ReportsHeaderSection";
import { VisaoGeralReportSection } from "./reports/components/sections/VisaoGeralReportSection";
import { ClientesReportSection } from "./reports/components/sections/ClientesReportSection";
import { FinanceiroReportSection } from "./reports/components/sections/FinanceiroReportSection";
import { OperacionalReportSection } from "./reports/components/sections/OperacionalReportSection";
import { AtendimentoReportSection } from "./reports/components/sections/AtendimentoReportSection";

interface DashboardViewProps {
  onNavigate?: (view: ReportType) => void;
  dataSources?: DashboardDataConfig;
}

export default function RelatoriosView({ onNavigate, dataSources }: DashboardViewProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportType>("visao-geral");
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { clientes, containers, agendamentos, estoque, transacoes } = useDashboardData(dataSources);

  const dateRange = useMemo(
    () => ({ from: filterDateFrom, to: filterDateTo }),
    [filterDateFrom, filterDateTo],
  );

  const transacoesFiltradas = useMemo(
    () => filterTransacoesByDateRange(transacoes, dateRange),
    [transacoes, dateRange],
  );
  const clientesFiltrados = useMemo(
    () => filterClientesByDateRange(clientes, dateRange),
    [clientes, dateRange],
  );
  const containersFiltrados = useMemo(
    () => filterContainersByDateRange(containers, dateRange),
    [containers, dateRange],
  );
  const agendamentosFiltrados = useMemo(
    () => filterAgendamentosByDateRange(agendamentos, dateRange),
    [agendamentos, dateRange],
  );

  // Estoque (normaliza porque a API pode retornar undefined nos campos).
  const estoqueSafe = {
    smallBoxes: estoque.smallBoxes ?? 0,
    mediumBoxes: estoque.mediumBoxes ?? 0,
    largeBoxes: estoque.largeBoxes ?? 0,
    personalizedItems: estoque.personalizedItems ?? 0,
    adhesiveTape: estoque.adhesiveTape ?? 0,
  };

  const itemKeys = Object.keys(ESTOQUE_MINIMO) as Array<keyof typeof ESTOQUE_MINIMO>;
  const quantidadeItensEstoque = itemKeys.length;
  const estoqueTotal = itemKeys.reduce((sum, key) => sum + estoqueSafe[key], 0);
  const estoqueBaixoCount = itemKeys.filter((key) => estoqueSafe[key] < ESTOQUE_MINIMO[key]).length;
  const estoqueIdealCount = itemKeys.filter((key) => estoqueSafe[key] >= ESTOQUE_IDEAL[key]).length;

  const gerarRelatorioPDF = (tipo: string) => {return;};

  const formatCurrency = (value: number) => formatCurrencyUSD(value);

  const estatisticas = useMemo<EstatisticasGerais>(
    () =>
      buildEstatisticasGerais({
        clientes: clientesFiltrados,
        containers: containersFiltrados,
        agendamentos: agendamentosFiltrados,
        transacoes: transacoesFiltradas,
      }),
    [clientesFiltrados, containersFiltrados, agendamentosFiltrados, transacoesFiltradas],
  );

  const clientesPorEstado = useMemo(() => buildClientesPorEstado(clientesFiltrados), [clientesFiltrados]);
  const receitasMensais = useMemo(() => buildReceitasMensais(transacoesFiltradas), [transacoesFiltradas]);
  const performanceAtendentes = useMemo<PerformanceAtendente[]>(
    () => buildPerformanceAtendentes({ clientes: clientesFiltrados, transacoes: transacoesFiltradas }),
    [clientesFiltrados, transacoesFiltradas],
  );

  const categoriasReceitaDespesa = useMemo<CategoriaReceitaDespesa[]>(
    () => buildCategoriasReceitaDespesa(transacoesFiltradas),
    [transacoesFiltradas],
  );

  const filteredClientes = useMemo(
    () => filterClientesBySearch({ clientes: clientesFiltrados, searchTerm }),
    [clientesFiltrados, searchTerm],
  );

  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
      <ReportsHeaderSection
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onExportAll={() => gerarRelatorioPDF("completo")}
        reportTypes={REPORT_TYPES}
        selectedReport={selectedReport}
        onSelectReport={(value) => {
          setSelectedReport(value);
          onNavigate?.(value);
        }}
        filterDateFrom={filterDateFrom}
        filterDateTo={filterDateTo}
        onFilterDateFromChange={setFilterDateFrom}
        onFilterDateToChange={setFilterDateTo}
        onClearFilters={() => {
          setFilterDateFrom("");
          setFilterDateTo("");
        }}
      />

      {selectedReport === "visao-geral" && (
        <VisaoGeralReportSection
          estatisticas={estatisticas}
          receitasMensais={receitasMensais}
          formatCurrency={formatCurrency}
          quantidadeItensEstoque={quantidadeItensEstoque}
          estoqueTotal={estoqueTotal}
          estoqueBaixoCount={estoqueBaixoCount}
          estoqueIdealCount={estoqueIdealCount}
        />
      )}

      {selectedReport === "clientes" && (
        <ClientesReportSection
          clientesPorEstado={clientesPorEstado}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          filteredClientes={filteredClientes}
        />
      )}

      {selectedReport === "financeiro" && (
        <FinanceiroReportSection
          estatisticas={estatisticas}
          transacoes={transacoesFiltradas}
          categoriasReceitaDespesa={categoriasReceitaDespesa}
          formatCurrency={formatCurrency}
          onExport={gerarRelatorioPDF}
        />
      )}

      {selectedReport === "operacional" && (
        <OperacionalReportSection
          estatisticas={estatisticas}
          quantidadeItensEstoque={quantidadeItensEstoque}
          estoqueBaixoCount={estoqueBaixoCount}
          estoqueIdealCount={estoqueIdealCount}
          onExport={gerarRelatorioPDF}
        />
      )}

      {selectedReport === "atendimento" && (
        <AtendimentoReportSection performanceAtendentes={performanceAtendentes} formatCurrency={formatCurrency} />
      )}
    </div>
  );
}

