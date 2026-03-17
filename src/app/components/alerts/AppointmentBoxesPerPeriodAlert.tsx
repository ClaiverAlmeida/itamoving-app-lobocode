import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Box } from "lucide-react";

export interface BoxesPerPeriodItem {
  collectionDate: string;
  qtyBoxes: number;
}

interface AppointmentBoxesPerPeriodAlertProps {
  /** Um item por dia (API): caixas no dia. */
  items: BoxesPerPeriodItem[];
}

function formatDateBR(iso: string) {
  const s = (iso ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return iso;
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

/**
   * Lista por dia: caixas agendadas no período.
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
        className="flex w-full min-w-0 flex-col items-start rounded-lg border border-slate-200/60 bg-slate-50/80 px-4 py-4 dark:border-slate-700/50 dark:bg-slate-950/30"
      >
        <div className="flex w-full items-start gap-3 text-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400">
            <Box className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600/90 dark:text-slate-400/90">
              Caixas no período (total)
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {total} {total === 1 ? "caixa" : "caixas"}
            </p>
          </div>
        </div>
        <ul className="mt-4 min-h-[8rem] max-h-72 w-full space-y-3 overflow-y-auto overflow-x-hidden text-sm">
          {list.map((row) => {
            const q = Number(row.qtyBoxes ?? 0);
            const qtyExcess = Math.max(0, (q ?? 0) - 13);
            const qtyAllowedExcess = Math.max(0, 13 - (q ?? 0));
            const isOver = qtyExcess > 0;

            return (
              <li
                key={row.collectionDate}
                className={
                  isOver
                    ? "mx-auto rounded-lg border border-red-200/60 bg-red-50/80 px-4 py-3 text-start dark:border-red-800/50 dark:bg-red-950/30"
                    : "mx-auto rounded-lg border border-blue-200/60 bg-blue-50/80 px-4 py-3 text-start dark:border-blue-800/50 dark:bg-blue-950/30"
                }
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  {formatDateBR(row.collectionDate)}
                </p>
                <p
                  className={
                    isOver
                      ? "mt-1 tabular-nums text-base font-semibold text-red-900 dark:text-red-100"
                      : "mt-1 tabular-nums text-base font-semibold text-blue-900 dark:text-blue-100"
                  }
                >
                  {q} {q === 1 ? "caixa" : "caixas"}
                </p>
                <p
                  className={
                    isOver
                      ? "mt-1 text-xs font-medium text-red-500"
                      : "mt-1 text-xs font-medium text-blue-500"
                  }
                >
                  {qtyExcess} {qtyExcess === 1 ? "caixa" : "caixas"} a mais do que o permitido
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {qtyAllowedExcess} {qtyAllowedExcess === 1 ? "caixa" : "caixas"} ainda {qtyAllowedExcess === 1 ? "é permitida" : "são permitidas"} no dia.
                </p>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}
