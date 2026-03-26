import React, { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { Lead, LeadsFilters, LeadsViewMode } from "./services/services.types";
import {
  mockLeads,
  INITIAL_LEADS_FILTERS,
  applyLeadNote,
  applyLeadStatusChange,
  buildLeadsStatistics,
  filterLeads,
} from "./services/index";
import {
  ServicesFiltersPanel,
  ServicesKanbanBoard,
  ServicesLeadDetailsDrawer,
  ServicesListView,
  ServicesMetricsCards,
  ServicesSearchBar,
  ServicesToolbar,
} from "./services/components";

export default function AtendimentosView() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<LeadsViewMode>("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LeadsFilters>(INITIAL_LEADS_FILTERS);
  const [novaNota, setNovaNota] = useState("");

  const filteredLeads = useMemo(() => filterLeads(leads, searchTerm, filters), [leads, searchTerm, filters]);
  const statistics = useMemo(() => buildLeadsStatistics(filteredLeads), [filteredLeads]);

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    setLeads((prev) => applyLeadStatusChange(prev, leadId, newStatus));
  };

  const handleAddNota = () => {
    if (!selectedLead || !novaNota.trim()) return;

    setLeads((prev) => applyLeadNote(prev, selectedLead.id, novaNota));
    setSelectedLead((prev) =>
      prev
        ? {
            ...prev,
            notas: prev.notas ? `${prev.notas}\n\n${novaNota}` : novaNota,
          }
        : prev,
    );
    setNovaNota("");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Pipeline de Atendimentos</h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">Gerenciamento de leads do WhatsApp Bot</p>
            </div>

            <ServicesToolbar
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
              viewMode={viewMode}
              onChangeViewMode={(m) => setViewMode(m)}
            />
          </div>

          <ServicesMetricsCards statistics={statistics} />

          <ServicesSearchBar searchTerm={searchTerm} onChange={setSearchTerm} />

          <ServicesFiltersPanel
            showFilters={showFilters}
            filters={filters}
            setFilters={setFilters}
            filteredCount={filteredLeads.length}
          />

          {viewMode === "kanban" ? (
            <ServicesKanbanBoard
              leads={filteredLeads}
              onSelectLead={setSelectedLead}
              onDropStatusChange={handleStatusChange}
            />
          ) : (
            <ServicesListView
              leads={filteredLeads}
              onSelect={(l) => setSelectedLead(l)}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>

        {selectedLead ? (
          <ServicesLeadDetailsDrawer
            selectedLead={selectedLead}
            onClose={() => setSelectedLead(null)}
            novaNota={novaNota}
            onNovaNotaChange={setNovaNota}
            onAddNota={handleAddNota}
          />
        ) : null}
      </div>
    </DndProvider>
  );
}

