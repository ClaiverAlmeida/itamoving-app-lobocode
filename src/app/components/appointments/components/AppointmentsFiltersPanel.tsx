import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, X } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";

type FiltersState = {
  status: string[];
  userId: string;
  periodo: "todos" | "hoje" | "semana" | "mes";
};

type StatusConfigItem = {
  label: string;
  color: string;
  textColor: string;
};

type Props = {
  showFilters: boolean;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  filteredCount: number;
  statusConfig: Record<string, StatusConfigItem>;
};

export function AppointmentsFiltersPanel({
  showFilters,
  filters,
  setFilters,
  filteredCount,
  statusConfig,
}: Props) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  📅 Período
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["todos", "hoje", "semana", "mes"] as const).map((periodo) => (
                    <Badge
                      key={periodo}
                      onClick={() => setFilters({ ...filters, periodo })}
                      className={`cursor-pointer px-4 py-2 transition-all ${filters.periodo === periodo
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {periodo === "todos" && "Todos"}
                      {periodo === "hoje" && "Hoje"}
                      {periodo === "semana" && "Esta Semana"}
                      {periodo === "mes" && "Este Mês"}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  🏷️ Status {filters.status.length > 0 && `(${filters.status.length})`}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["PENDING", "CONFIRMED", "COLLECTED", "CANCELLED"] as const).map((s) => {
                    const config = statusConfig[s];
                    const isSelected = filters.status.includes(s);
                    return (
                      <Badge
                        key={s}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            status: isSelected
                              ? filters.status.filter((x) => x !== s)
                              : [...filters.status, s],
                          });
                        }}
                        className={`flex cursor-pointer items-center gap-2 px-4 py-2 transition-all ${isSelected
                          ? `${config.color} text-white`
                          : `border border-slate-300 bg-white ${config.textColor} hover:bg-slate-100`
                          }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  👤 Atendente
                </label>
                <Input
                  placeholder="Digite o nome da atendente..."
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="text-xs text-slate-600">
                {filteredCount} agendamento(s) encontrado(s)
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({
                    status: [],
                    userId: "",
                    periodo: "todos",
                  })
                }
                className="text-slate-600 hover:text-slate-900"
              >
                <X className="mr-1 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

