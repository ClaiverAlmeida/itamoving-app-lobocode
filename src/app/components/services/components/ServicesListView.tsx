import React from "react";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import type { Lead, LeadStatus } from "../services.types";
import { PRIORIDADE_CONFIG, STATUS_CONFIG, STATUS_ORDER } from "../services.constants";
import { formatCurrency } from "../services.utils";

export function ServicesListView({
  leads,
  onSelect,
  onStatusChange,
}: {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
}) {
  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const config = STATUS_CONFIG[lead.status];
        return (
          <Card
            key={lead.id}
            className="p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer border-l-4"
            style={{ borderLeftColor: config.color.replace("bg-", "#").replace("500", "600") }}
            onClick={() => onSelect(lead)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold break-words">{lead.nome}</h3>
                  <Badge className={config.color}>{config.label}</Badge>
                  {lead.prioridade && (
                    <Badge variant="outline" className={PRIORIDADE_CONFIG[lead.prioridade].color}>
                      {PRIORIDADE_CONFIG[lead.prioridade].label}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground break-words">
                  {lead.origem} → {lead.destino}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">"{lead.ultimaMensagem}"</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {lead.valorEstimado ? (
                  <span className="font-semibold text-green-600">{formatCurrency(lead.valorEstimado)}</span>
                ) : null}

                <select
                  value={lead.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className="px-2 py-1 text-xs border border-border rounded-md bg-white"
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        );
      })}

      {leads.length === 0 && <Card className="p-6 text-center text-muted-foreground">Nenhum lead encontrado.</Card>}
    </div>
  );
}

