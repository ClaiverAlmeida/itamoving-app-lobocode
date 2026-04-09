import React from "react";
import { motion } from "motion/react";
import type { EstatisticasGerais } from "../../reports.payload";
import { OperacionalContainersCardsGrid } from "../../cards/OperacionalContainersCardsGrid";
import { OperacionalOtherCardsGrid } from "../../cards/OperacionalOtherCardsGrid";

export function OperacionalReportSection(props: {
  estatisticas: EstatisticasGerais;
  quantidadeItensEstoque: number;
  estoqueBaixoCount: number;
  estoqueIdealCount: number;
  onExport: (tipo: string) => void;
}) {
  const { estatisticas, quantidadeItensEstoque, estoqueBaixoCount, estoqueIdealCount, onExport } = props;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <OperacionalContainersCardsGrid estatisticas={estatisticas} onExport={onExport} />
      <OperacionalOtherCardsGrid
        estatisticas={estatisticas}
        quantidadeItensEstoque={quantidadeItensEstoque}
        estoqueBaixoCount={estoqueBaixoCount}
        estoqueIdealCount={estoqueIdealCount}
        onExport={onExport}
      />
    </motion.div>
  );
}

