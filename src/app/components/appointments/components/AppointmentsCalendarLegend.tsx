import React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { Label } from "../../ui/label";
import { cn } from "../../ui/utils";

export function AppointmentsCalendarLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/80 cursor-pointer"
        aria-expanded={open}
        aria-controls="calendar-legend-panel"
        id="calendar-legend-toggle"
      >
        <Label
          htmlFor="calendar-legend-toggle"
          className="pointer-events-none text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Legenda do Calendário de Agendamentos
        </Label>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-slate-600 transition-transform duration-300 ease-out motion-reduce:transition-none dark:text-slate-400",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id="calendar-legend-panel" className="min-h-0 overflow-hidden px-4">
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-t border-slate-100 pb-4 pt-3 dark:border-slate-800"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-sm" style={{ background: "rgba(249, 115, 22, 0.6)" }} />
                <span className="text-sm text-slate-700 dark:text-slate-200">Dia Atual</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-sm" style={{ background: "rgba(187, 247, 208, 0.6)" }} />
                <span className="text-sm text-slate-700 dark:text-slate-200">Intervalo do Período de Coleta</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-sm" style={{ background: "rgba(139, 92, 246, 0.6)" }} />
                <span className="text-sm text-slate-700 dark:text-slate-200">Agendamento Único</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-sm"
                  style={{ background: "linear-gradient(90deg, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(249, 115, 22, 0.6) 50%, rgba(249, 115, 22, 0.6) 100%)" }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">Dia Atual com Agendamento Único</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-sm"
                  style={{ background: "linear-gradient(90deg, rgba(249, 115, 22, 0.6) 0%, rgba(249, 115, 22, 0.6) 50%, rgba(187, 247, 208, 0.6) 50%, rgba(187, 247, 208, 0.6) 100%)" }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">Dia Atual dentro do Período de Coleta</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-sm"
                  style={{ background: "linear-gradient(90deg, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(187, 247, 208, 0.6) 50%, rgba(187, 247, 208, 0.6) 100%)" }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">Agendamento Periódico do Período de Coleta</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-sm border border-slate-900/60 bg-transparent dark:border-slate-200/70" />
                <span className="text-sm text-slate-700 dark:text-slate-200">Dia Selecionado</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

