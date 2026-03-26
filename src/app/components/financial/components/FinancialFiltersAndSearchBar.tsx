import React from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import type { PeriodFilter, ViewMode } from "../financial.constants";

export function FinancialFiltersAndSearchBar(props: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  periodFilter: PeriodFilter;
  onPeriodFilterChange: (value: PeriodFilter) => void;
}) {
  const { searchTerm, onSearchTermChange, viewMode, onViewModeChange, periodFilter, onPeriodFilterChange } = props;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição, categoria ou cliente..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30 w-full sm:w-auto">
        <Button
          variant={viewMode === "todas" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("todas")}
          className="flex-1 sm:flex-none"
        >
          Todas
        </Button>
        <Button
          variant={viewMode === "receitas" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("receitas")}
          className="flex-1 sm:flex-none"
        >
          Receitas
        </Button>
        <Button
          variant={viewMode === "despesas" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("despesas")}
          className="flex-1 sm:flex-none"
        >
          Despesas
        </Button>
      </div>

      <select
        value={periodFilter}
        onChange={(e) => onPeriodFilterChange(e.target.value as PeriodFilter)}
        className="px-3 py-2 border border-border rounded-lg text-sm bg-white w-full sm:w-auto"
      >
        <option value="todos">Todos os períodos</option>
        <option value="mes">Último mês</option>
        <option value="trimestre">Último trimestre</option>
        <option value="ano">Último ano</option>
      </select>
    </div>
  );
}

