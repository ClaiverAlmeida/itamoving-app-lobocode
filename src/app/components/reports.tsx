import React, { useMemo, useState } from "react";
import { useDashboardData, type DashboardDataConfig } from "../hooks/useDashboardData";
import { ESTOQUE_IDEAL, ESTOQUE_MINIMO } from "./stock";
import type { ReportType } from "./reports/reports.constants";
import { REPORT_TYPES } from "./reports/reports.constants";
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

  const { clientes, containers, agendamentos, estoque, transacoes } = useDashboardData(dataSources);

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

  const gerarRelatorioPDF = (tipo: string) => {
    alert(`Gerando relatório de ${tipo}... (funcionalidade demonstrativa)`);
  };

  const formatCurrency = (value: number) => formatCurrencyUSD(value);

  const estatisticas = useMemo<EstatisticasGerais>(
    () => buildEstatisticasGerais({ clientes, containers, agendamentos, transacoes }),
    [clientes, containers, agendamentos, transacoes],
  );

  const clientesPorEstado = useMemo(() => buildClientesPorEstado(clientes), [clientes]);
  const receitasMensais = useMemo(() => buildReceitasMensais(transacoes), [transacoes]);
  const performanceAtendentes = useMemo<PerformanceAtendente[]>(
    () => buildPerformanceAtendentes({ clientes, transacoes }),
    [clientes, transacoes],
  );

  const categoriasReceitaDespesa = useMemo<CategoriaReceitaDespesa[]>(
    () => buildCategoriasReceitaDespesa(transacoes),
    [transacoes],
  );

  const filteredClientes = useMemo(() => filterClientesBySearch({ clientes, searchTerm }), [clientes, searchTerm]);

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
          transacoes={transacoes}
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

