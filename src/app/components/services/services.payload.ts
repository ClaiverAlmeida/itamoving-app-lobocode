import type { Lead, LeadStatus } from "./services.types";

export function applyLeadStatusChange(leads: Lead[], leadId: string, newStatus: LeadStatus): Lead[] {
  return leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead));
}

export function applyLeadNote(leads: Lead[], leadId: string, nota: string): Lead[] {
  return leads.map((lead) => {
    if (lead.id !== leadId) return lead;
    return { ...lead, notas: lead.notas ? `${lead.notas}\n\n${nota}` : nota };
  });
}

