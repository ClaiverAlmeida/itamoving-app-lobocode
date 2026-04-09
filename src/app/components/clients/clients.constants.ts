export const HISTORY_PAGE_SIZE = 10;

/** Itens por página na visualização em lista. */
export const CLIENTS_LIST_PAGE_SIZE = 10;

/** Itens por página na visualização em grelha. */
export const CLIENTS_GRID_PAGE_SIZE = 12;

export type ClientsViewMode = 'grid' | 'list';

export type OrigemHistorico = 'client' | 'appointment' | 'container' | 'legacy';

export interface ClienteAtividade {
  id: string;
  tipo: 'cadastro' | 'agendamento' | 'container' | 'atualizacao' | 'exclusao';
  origem: OrigemHistorico;
  descricao: string;
  owner: {
    id: string;
    name: string;
  };
  data: Date;
}

export interface HistoricoPaginado {
  items: ClienteAtividade[];
  total: number;
  page: number;
  totalPages: number;
}

export const ATIVIDADE_COLOR_CLASSES: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  green: { bg: 'bg-green-100', icon: 'text-green-600' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  red: { bg: 'bg-red-100', icon: 'text-red-600' },
  orange: { bg: 'bg-orange-100', icon: 'text-orange-600' },
  emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600' },
  cyan: { bg: 'bg-cyan-100', icon: 'text-cyan-600' },
  rose: { bg: 'bg-rose-100', icon: 'text-rose-600' },
};

export type AtividadeColorKey = keyof typeof ATIVIDADE_COLOR_CLASSES;

export const CLIENT_HISTORY_FIELD_LABEL: Record<string, string> = {
  usaName: 'Nome (USA)',
  usaCpf: 'CPF (USA)',
  usaPhone: 'Telefone EUA',
  usaAddress: 'Endereço EUA',
  brazilName: 'Nome Recebedor (Brasil)',
  brazilCpf: 'CPF Recebedor (Brasil)',
  brazilPhone: 'Telefone Brasil',
  brazilAddress: 'Endereço Brasil',
  userId: 'Atendente',
  status: 'Status',
};
