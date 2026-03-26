import React from "react";
import { STATUS_CONFIG, STATUS_ORDER } from "../services.constants";
import type { Lead, LeadStatus } from "../services.types";
import { getLeadsByStatus, getTotalValorByStatus } from "../services.utils";
import { ServicesKanbanCard } from "./ServicesKanbanCard";
import { ServicesKanbanColumn } from "./ServicesKanbanColumn";

export function ServicesKanbanBoard({
  leads,
  onSelectLead,
  onDropStatusChange,
}: {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDropStatusChange: (leadId: string, status: LeadStatus) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status) => {
        const leadsDoStatus = getLeadsByStatus(leads, status);
        const totalValue = getTotalValorByStatus(leads, status);

        return (
          <ServicesKanbanColumn
            key={status}
            status={status}
            count={leadsDoStatus.length}
            totalValue={totalValue}
            onDrop={(leadId, newStatus) => onDropStatusChange(leadId, newStatus)}
          >
            {leadsDoStatus.map((lead) => (
              <ServicesKanbanCard key={lead.id} lead={lead} onSelect={onSelectLead} />
            ))}
          </ServicesKanbanColumn>
        );
      })}
    </div>
  );
}

