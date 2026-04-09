import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Box } from "lucide-react";

export interface BoxesPerDayItem {
  collectionDate: string;
  qtyBoxes: number;
}

interface AppointmentBoxesPerDayAlertProps {
  /** Lista de quantidades por dia (retorno da API). */
  qtdCaixasPorDia: BoxesPerDayItem[];
  /** Data selecionada no formulário (YYYY-MM-DD) para buscar a quantidade do dia. */
  collectionDate: string;
  /** Limite de caixas permitidas no dia (default 13). */
  qtyAllowed?: number;
}

/**
 * Exibe o resumo de caixas agendadas para o dia selecionado (excesso / permitidas).
 * Reutilizado no modal de novo agendamento e no modal de edição.
 */
export function AppointmentBoxesPerDayAlert({
  qtdCaixasPorDia,
  collectionDate,
  qtyAllowed = 13,
}: AppointmentBoxesPerDayAlertProps) {
  const dateStr = (collectionDate ?? "").trim().slice(0, 10);
  if (!dateStr || dateStr.length < 10) return null;

  const list = Array.isArray(qtdCaixasPorDia) ? qtdCaixasPorDia : [];
  const item =
    list.length === 1
      ? list[0]
      : list.find((q) => (q.collectionDate ?? "").slice(0, 10) === dateStr);
  const qty =
    item != null && typeof item.qtyBoxes === "number" ? item.qtyBoxes : null;
  const qtyExcess = Math.max(0, (qty ?? 0) - qtyAllowed);
  const qtyAllowedExcess = Math.max(0, qtyAllowed - (qty ?? 0));
  const isOver = qtyExcess > 0;
  const existe = list.length > 0 && qty !== null;

  if (!existe) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={
          isOver
            ? "rounded-lg border border-red-200/60 bg-red-50/80 dark:bg-red-950/30 dark:border-red-800/50 px-4 py-3"
            : "rounded-lg border border-blue-200/60 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800/50 px-4 py-3"
        }
      >
        <div className="flex items-center gap-3">
          <div
            className={
              isOver
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400"
            }
          >
            <Box className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={
                isOver
                  ? "text-xs font-medium uppercase tracking-wide text-red-700/80 dark:text-red-300/80"
                  : "text-xs font-medium uppercase tracking-wide text-blue-700/80 dark:text-blue-300/80"
              }
            >
              Caixas agendadas para este dia
            </p>
            <p
              className={
                isOver
                  ? "mt-0.5 text-lg font-semibold tabular-nums text-red-900 dark:text-red-100"
                  : "mt-0.5 text-lg font-semibold tabular-nums text-blue-900 dark:text-blue-100"
              }
            >
              {qty} {qty === 1 ? "caixa" : "caixas"}
            </p>
            <p
              className={
                isOver
                  ? "text-xs font-medium text-red-500 mt-1"
                  : "text-xs font-medium text-blue-500 mt-1"
              }
            >
              {qtyExcess} caixas a mais do que o permitido
            </p>
            <p className="text-xs font-medium text-black-500 mt-1 dark:text-neutral-400">
              {qtyAllowedExcess} caixas ainda são permitidas no dia.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
