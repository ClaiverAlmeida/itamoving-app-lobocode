export type LeadStatus =
  | "novo"
  | "qualificando"
  | "orcamento"
  | "negociando"
  | "fechado"
  | "perdido";

export type LeadPriority = "alta" | "media" | "baixa";

export type LeadMessageSender = "cliente" | "bot" | "atendente";

export interface LeadConversation {
  id: string;
  texto: string;
  remetente: LeadMessageSender;
  data: Date;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  origem: string;
  destino: string;
  ultimaMensagem: string;
  dataUltimaMensagem: Date;
  status: LeadStatus;
  atendidoPorBot: boolean;
  conversas: LeadConversation[];
  valorEstimado?: number;
  dataMudanca?: string;
  tags?: string[];
  notas?: string;
  prioridade?: LeadPriority;
}

export type LeadsViewMode = "kanban" | "list";
export type LeadsPeriodFilter = "todos" | "hoje" | "semana" | "mes";

export interface LeadsFilters {
  prioridade: string[];
  origem: string;
  valorMin: string;
  valorMax: string;
  periodo: LeadsPeriodFilter;
}

export interface LeadsStatistics {
  total: number;
  totalValor: number;
  taxaConversao: number;
  ticketMedio: number;
}

