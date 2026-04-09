import React from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { LeadsFilters } from "../services.types";
import { INITIAL_LEADS_FILTERS, PRIORIDADE_CONFIG } from "../services.constants";

const PERIOD_LABELS: Record<LeadsFilters["periodo"], string> = {
  todos: "Todos",
  hoje: "Hoje",
  semana: "Esta Semana",
  mes: "Este Mês",
};

export function ServicesFiltersPanel({
  showFilters,
  filters,
  setFilters,
  filteredCount,
}: {
  showFilters: boolean;
  filters: LeadsFilters;
  setFilters: (next: LeadsFilters) => void;
  filteredCount: number;
}) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-3 block text-slate-700">📅 Período</label>
                <div className="flex gap-2 flex-wrap">
                  {(["todos", "hoje", "semana", "mes"] as const).map((periodo) => (
                    <Badge
                      key={periodo}
                      onClick={() => setFilters({ ...filters, periodo })}
                      className={`cursor-pointer px-4 py-2 transition-all ${
                        filters.periodo === periodo ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {PERIOD_LABELS[periodo]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block text-slate-700">
                  🔥 Prioridade {filters.prioridade.length > 0 ? `(${filters.prioridade.length})` : ""}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(["alta", "media", "baixa"] as const).map((p) => {
                    const isSelected = filters.prioridade.includes(p);
                    const config = PRIORIDADE_CONFIG[p];
                    return (
                      <Badge
                        key={p}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            prioridade: isSelected ? filters.prioridade.filter((x) => x !== p) : [...filters.prioridade, p],
                          });
                        }}
                        className={`cursor-pointer px-4 py-2 transition-all flex items-center gap-2 ${
                          isSelected ? "bg-slate-700 text-white" : `bg-white ${config.color} border border-slate-300 hover:bg-slate-100`
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-3 block text-slate-700">📍 Origem</label>
                  <Input
                    placeholder="Miami, Orlando..."
                    value={filters.origem}
                    onChange={(e) => setFilters({ ...filters, origem: e.target.value })}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-3 block text-slate-700">💰 Valor Mínimo</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.valorMin}
                    onChange={(e) => setFilters({ ...filters, valorMin: e.target.value })}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-3 block text-slate-700">💵 Valor Máximo</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.valorMax}
                    onChange={(e) => setFilters({ ...filters, valorMax: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-600">{filteredCount} lead(s) encontrado(s)</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(INITIAL_LEADS_FILTERS)}
                className="text-slate-600 hover:text-slate-900"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Filtros
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

