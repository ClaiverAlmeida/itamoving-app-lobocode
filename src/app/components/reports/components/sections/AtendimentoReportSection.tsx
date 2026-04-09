import React from "react";
import { motion } from "motion/react";
import type { PerformanceAtendente } from "../../reports.payload";
import { AtendimentoPerformanceRankingList } from "../../cards/AtendimentoPerformanceRankingList";

export function AtendimentoReportSection(props: { performanceAtendentes: PerformanceAtendente[]; formatCurrency: (value: number) => string }) {
  const { performanceAtendentes, formatCurrency } = props;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <AtendimentoPerformanceRankingList performanceAtendentes={performanceAtendentes} formatCurrency={formatCurrency} />
    </motion.div>
  );
}

