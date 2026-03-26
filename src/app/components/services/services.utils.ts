import type { Lead, LeadStatus, LeadsFilters, LeadsStatistics } from "./services.types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(value);
}

export function getTempoDecorrido(data: Date) {
  const diff = Date.now() - data.getTime();
  const horas = Math.floor(diff / (1000 * 60 * 60));

  if (horas < 1) {
    const minutos = Math.floor(diff / (1000 * 60));
    return `${minutos}m`;
  }
  if (horas < 24) return `${horas}h`;
  const dias = Math.floor(horas / 24);
  return `${dias}d`;
}

export function getAISuggestion(lead: Lead): string {
  const horasDecorridas = Math.floor((Date.now() - lead.dataUltimaMensagem.getTime()) / (1000 * 60 * 60));

  if (lead.status === "novo" && horasDecorridas > 2) return "⚡ Responda urgente! Cliente novo sem resposta há mais de 2h.";
  if (lead.status === "qualificando" && lead.valorEstimado && lead.valorEstimado > 10000)
    return "💎 Lead de alto valor! Ofereça atendimento premium.";
  if (lead.status === "orcamento" && horasDecorridas > 24)
    return "📞 Follow-up recomendado. Orçamento sem resposta há 1+ dia.";
  if (lead.status === "negociando" && lead.tags?.includes("desconto-solicitado"))
    return "💰 Considere oferecer condição especial para fechar.";
  if (lead.prioridade === "alta") return "🔥 Prioridade alta! Atenda com urgência.";

  return "✅ Continue acompanhando normalmente.";
}

export function filterLeads(leads: Lead[], searchTerm: string, filters: LeadsFilters) {
  return leads.filter((lead) => {
    // Search
    const matchesSearch =
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm) ||
      lead.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.destino.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Prioridade
    if (filters.prioridade.length > 0 && !filters.prioridade.includes(lead.prioridade || "")) return false;

    // Origem
    if (filters.origem && !lead.origem.toLowerCase().includes(filters.origem.toLowerCase())) return false;

    // Valor
    if (filters.valorMin && lead.valorEstimado && lead.valorEstimado < parseFloat(filters.valorMin)) return false;
    if (filters.valorMax && lead.valorEstimado && lead.valorEstimado > parseFloat(filters.valorMax)) return false;

    // Período
    if (filters.periodo !== "todos") {
      const now = new Date();
      const leadDate = lead.dataUltimaMensagem;

      if (filters.periodo === "hoje") {
        if (leadDate.toDateString() !== now.toDateString()) return false;
      } else if (filters.periodo === "semana") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (leadDate < weekAgo) return false;
      } else if (filters.periodo === "mes") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (leadDate < monthAgo) return false;
      }
    }

    return true;
  });
}

export function getLeadsByStatus(leads: Lead[], status: LeadStatus) {
  return leads.filter((lead) => lead.status === status);
}

export function getTotalValorByStatus(leads: Lead[], status: LeadStatus) {
  return getLeadsByStatus(leads, status).reduce((sum, lead) => sum + (lead.valorEstimado || 0), 0);
}

export function buildLeadsStatistics(filteredLeads: Lead[]): LeadsStatistics {
  const total = filteredLeads.length;
  const totalValor = filteredLeads.reduce((sum, lead) => sum + (lead.valorEstimado || 0), 0);
  const taxaConversao = total > 0 ? (getLeadsByStatus(filteredLeads, "fechado").length / total) * 100 : 0;
  const ticketMedio = total > 0 ? totalValor / total : 0;
  return { total, totalValor, taxaConversao, ticketMedio };
}

