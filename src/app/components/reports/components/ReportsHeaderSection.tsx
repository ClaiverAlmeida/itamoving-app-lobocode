import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../../ui/button";
import { Filter, Download } from "lucide-react";
import type { ReportType } from "../reports.constants";
import { ReportsFiltersPanel } from "./filters/ReportsFiltersPanel";

export function ReportsHeaderSection(props: {
  showFilters: boolean;
  onToggleFilters: () => void;
  onExportAll: () => void;
  reportTypes: Array<{
    id: ReportType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  selectedReport: ReportType;
  onSelectReport: (value: ReportType) => void;
  filterDateFrom: string;
  filterDateTo: string;
  onFilterDateFromChange: (value: string) => void;
  onFilterDateToChange: (value: string) => void;
  onClearFilters: () => void;
}) {
  const {
    showFilters,
    onToggleFilters,
    onExportAll,
    reportTypes,
    selectedReport,
    onSelectReport,
    filterDateFrom,
    filterDateTo,
    onFilterDateFromChange,
    onFilterDateToChange,
    onClearFilters,
  } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Relatórios e Análises</h2>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Dashboards executivos e insights de negócio</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={onToggleFilters}
            className="w-full sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onExportAll}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Tudo
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            key="reports-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-1 pt-0.5">
              <ReportsFiltersPanel
                dateFrom={filterDateFrom}
                dateTo={filterDateTo}
                onDateFromChange={onFilterDateFromChange}
                onDateToChange={onFilterDateToChange}
                onClear={onClearFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={selectedReport === type.id ? "default" : "outline"}
              onClick={() => onSelectReport(type.id)}
              className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

