import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Box } from "lucide-react";

export interface BoxesPerPeriodItem {
  qtyBoxes: number;
}

interface AppointmentBoxesPerPeriodAlertProps {
  /** Lista retornada da API (período com total de caixas). */
  items: BoxesPerPeriodItem[];
}

/**
 * Exibe apenas o total de caixas do período selecionado.
 * Estilo igual ao de dia, porém mais básico e com cor diferenciada (slate/neutro).
 */
export function AppointmentBoxesPerPeriodAlert({
  items,
}: AppointmentBoxesPerPeriodAlertProps) {
  const list = Array.isArray(items) ? items : [];
  const total = list.reduce((acc, i) => acc + Number(i.qtyBoxes ?? 0), 0);

  if (list.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="rounded-lg border border-slate-200/60 bg-slate-50/80 dark:bg-slate-950/30 dark:border-slate-700/50 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400">
            <Box className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600/90 dark:text-slate-400/90">
              Caixas no período
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {total} {total === 1 ? "caixa" : "caixas"}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
