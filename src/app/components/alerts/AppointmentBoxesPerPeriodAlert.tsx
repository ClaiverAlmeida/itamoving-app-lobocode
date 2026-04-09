import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Box, ChevronDown } from "lucide-react";

export interface BoxesPerPeriodItem {
  collectionDate: string;
  qtyBoxes: number;
}

interface AppointmentBoxesPerPeriodAlertProps {
  /** Um item por dia (API): caixas no dia. */
  items: BoxesPerPeriodItem[];
  /** Caixas de agendamentos periódicos sem data (só entram no total do topo, sem card extra). */
  extrasSemDiaColeta?: number;
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
  extrasSemDiaColeta = 0,
}: AppointmentBoxesPerPeriodAlertProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const list = Array.isArray(items) ? items : [];
  const extra = Math.max(0, Number(extrasSemDiaColeta) || 0);
  const total =
    list.reduce((acc, i) => acc + Number(i.qtyBoxes ?? 0), 0) + extra;
  const totalBoxes = list.length * 13;

  const qtyBoxesExcess = Math.max(0, total - totalBoxes);
  const qtyBoxesAllowed = Math.max(0, totalBoxes - total);
  const isOverBoxes = qtyBoxesExcess > 0;

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
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-inline items-center justify-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400">
              <Box className="h-4 w-4" />
            </div>
            <p className="col-span-full text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-left">
              Caixas no período
            </p>
          </div>

          <div className="grid w-full min-w-0 max-w-full flex-4 grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-3">
            {/* Permitidas no período - Total */}
            <div className="flex min-h-[4.25rem] flex-1 flex-col justify-center rounded-lg border border-slate-200/90 bg-white/90 px-3 py-2.5 text-center shadow-sm dark:border-slate-600/50 dark:bg-slate-900/60 sm:text-left">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Permitidas no período
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums leading-none text-slate-800 dark:text-slate-100">
                {totalBoxes}
              </p>
            </div>

            {/* Agendadas agora */}
            <div className="flex min-h-[4.25rem] flex-1 flex-col justify-center rounded-lg border border-slate-200/90 bg-white/90 px-3 py-2.5 text-center shadow-sm dark:border-slate-600/50 dark:bg-slate-900/60 sm:text-left">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Agendadas agora
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums leading-none text-slate-900 dark:text-slate-100">
                {total}
              </p>
            </div>

            {/* Em excesso */}
            <div className={
              `flex min-h-[4.25rem] flex-1 flex-col justify-center rounded-lg border px-3 py-2.5 text-center shadow-sm sm:text-left
              ${isOverBoxes
                ? "border-red-200/60 bg-red-50/80 dark:border-red-800/50 dark:bg-red-950/30"
                : "border-blue-200/60 bg-blue-50/80 dark:border-blue-800/50 dark:bg-blue-950/30"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${isOverBoxes ? 'text-red-900' : 'text-blue-900'
                }`
              }>
                Em excesso
              </p>
              <p
                className=
                {
                  isOverBoxes
                    ? "mt-1 text-2xl font-bold tabular-nums leading-none text-red-900 dark:text-red-100"
                    : "mt-1 text-2xl font-bold tabular-nums leading-none text-blue-900 dark:text-blue-100"
                }
              >
                {qtyBoxesExcess}
              </p>
            </div>

            {/* Permitidas ainda no período */}
            <div className={`flex min-h-[4.25rem] flex-1 flex-col justify-center rounded-lg border border-slate-200/90 bg-white/90 px-3 py-2.5 text-center shadow-sm dark:border-slate-600/50 dark:bg-slate-900/60 sm:text-left`}>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Permitidas
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums leading-none text-slate-900 dark:text-slate-100">
                {qtyBoxesAllowed}
              </p>
            </div>

          </div>
        </div>

        <div className="mt-3 w-full">
          <details
            className="overflow-hidden rounded-lg border border-slate-200/90 bg-white/90 shadow-sm dark:border-slate-600/50 dark:bg-slate-900/55"
            open={isDetailsOpen}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100/90 dark:text-slate-100 dark:hover:bg-slate-800/40 [&::-webkit-details-marker]:hidden"
              onClick={(e) => {
                e.preventDefault();
                setIsDetailsOpen((open) => !open);
              }}
            >
              <span className="min-w-0 leading-snug flex flex-inline items-center gap-2 w-full justify-between">
                <span className="block text-[13px] font-semibold text-slate-900 dark:text-slate-50">
                  Caixas no período
                </span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  {isDetailsOpen ? "Fechar detalhes" : "Ver detalhes"}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${isDetailsOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </summary>
            <div className="max-h-72 min-h-[8rem] overflow-y-auto overflow-x-hidden overscroll-contain border-t border-slate-200/70 bg-slate-50/50 px-3 py-3 dark:border-slate-600/50 dark:bg-slate-950/25">
              <ul className="w-full space-y-3 text-sm">
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
            </div>
          </details>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
