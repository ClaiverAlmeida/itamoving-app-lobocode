import React from "react";
import { motion } from "motion/react";
import type { EstatisticasGerais, ReceitaMensal } from "../../reports.payload";
import { ReceitasMensaisAreaChart } from "../charts/ReceitasMensaisAreaChart";
import { ContainersStatusPieChart } from "../charts/ContainersStatusPieChart";
import { VisaoGeralInformativeCardsGrid } from "../../cards/VisaoGeralInformativeCardsGrid";
import { VisaoGeralKpisMainGrid } from "../../cards/VisaoGeralKpisMainGrid";

export function VisaoGeralReportSection(props: {
  estatisticas: EstatisticasGerais;
  receitasMensais: ReceitaMensal[];
  formatCurrency: (value: number) => string;
  quantidadeItensEstoque: number;
  estoqueTotal: number;
  estoqueBaixoCount: number;
  estoqueIdealCount: number;
}) {
  const { estatisticas, receitasMensais, formatCurrency, quantidadeItensEstoque, estoqueTotal, estoqueBaixoCount, estoqueIdealCount } = props;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <VisaoGeralKpisMainGrid estatisticas={estatisticas} formatCurrency={formatCurrency} />

      <div className="grid gap-6 md:grid-cols-2">
        <ReceitasMensaisAreaChart receitasMensais={receitasMensais} formatCurrency={formatCurrency} />
        <ContainersStatusPieChart
          containersPreparacao={estatisticas.containersPreparacao}
          containersTransito={estatisticas.containersTransito}
          containersEntregue={estatisticas.containersEntregue}
        />
      </div>

      <VisaoGeralInformativeCardsGrid
        estatisticas={estatisticas}
        quantidadeItensEstoque={quantidadeItensEstoque}
        estoqueTotal={estoqueTotal}
        estoqueBaixoCount={estoqueBaixoCount}
        estoqueIdealCount={estoqueIdealCount}
      />
    </motion.div>
  );
}

