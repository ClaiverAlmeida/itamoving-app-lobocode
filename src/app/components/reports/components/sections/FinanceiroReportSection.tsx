import React from "react";
import { motion } from "motion/react";
import type { CategoriaDespesa, EstatisticasGerais } from "../../reports.payload";
import type { FinancialTransaction } from "../../../api";
import { FinanceTotalsCards } from "../../cards/FinanceTotalsCards";
import { DespesasPorCategoriaBarChart } from "../charts/DespesasPorCategoriaBarChart";

export function FinanceiroReportSection(props: {
  estatisticas: EstatisticasGerais;
  transacoes: FinancialTransaction[];
  categoriasDespesas: CategoriaDespesa[];
  formatCurrency: (value: number) => string;
  onExport: (tipo: string) => void;
}) {
  const { estatisticas, transacoes, categoriasDespesas, formatCurrency, onExport } = props;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <FinanceTotalsCards estatisticas={estatisticas} transacoes={transacoes} formatCurrency={formatCurrency} onExport={onExport} />
      <DespesasPorCategoriaBarChart categoriasDespesas={categoriasDespesas} formatCurrency={formatCurrency} />
    </motion.div>
  );
}

