import React from "react";
import { Button } from "../../ui/button";
import type { LeadsViewMode } from "../services.types";
import { Filter, Download, LayoutGrid, List as ListIcon } from "lucide-react";

export function ServicesToolbar({
  showFilters,
  onToggleFilters,
  viewMode,
  onChangeViewMode,
}: {
  showFilters: boolean;
  onToggleFilters: () => void;
  viewMode: LeadsViewMode;
  onChangeViewMode: (mode: LeadsViewMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
      <Button
        variant={showFilters ? "default" : "outline"}
        size="sm"
        onClick={onToggleFilters}
        className="w-full sm:w-auto"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros
      </Button>

      <Button variant="outline" size="sm" className="w-full sm:w-auto">
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>

      <div className="col-span-2 flex gap-1 border border-border rounded-lg p-1 bg-muted/30 sm:col-span-1">
        <Button
          variant={viewMode === "kanban" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChangeViewMode("kanban")}
          className="flex-1 sm:flex-none"
        >
          <LayoutGrid className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Kanban</span>
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChangeViewMode("list")}
          className="flex-1 sm:flex-none"
        >
          <ListIcon className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Lista</span>
        </Button>
      </div>
    </div>
  );
}

