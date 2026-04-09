import React from "react";
import { motion } from "motion/react";
import type { CategoriaReceitaDespesa, EstatisticasGerais } from "../../reports.payload";
import type { FinancialTransaction } from "../../../../api";
import { FinanceTotalsCards } from "../../cards/FinanceTotalsCards";
import { DespesasPorCategoriaBarChart } from "../charts/DespesasPorCategoriaBarChart";

export function FinanceiroReportSection(props: {
  estatisticas: EstatisticasGerais;
  transacoes: FinancialTransaction[];
  categoriasReceitaDespesa: CategoriaReceitaDespesa[];
  formatCurrency: (value: number) => string;
  onExport: (tipo: string) => void;
}) {
  const { estatisticas, transacoes, categoriasReceitaDespesa, formatCurrency, onExport } = props;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <FinanceTotalsCards estatisticas={estatisticas} transacoes={transacoes} formatCurrency={formatCurrency} onExport={onExport} />
      <DespesasPorCategoriaBarChart categoriasReceitaDespesa={categoriasReceitaDespesa} formatCurrency={formatCurrency} />
    </motion.div>
  );
}

