/**
 * Cliente no app após `clients.service` (endereços JSON normalizados para objeto com rua/cidade/etc.;
 * escalares com os mesmos nomes do backend / Prisma).
 */
export interface Client {
  id: string;
  usaName: string;
  usaCpf: string;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  brazilName: string;
  brazilCpf: string;
  brazilPhone: string;
  brazilAddress: Record<string, unknown>;
  user?: {
    id: string;
    name: string;
  };
  createdAt: string;
  status: "ACTIVE" | "INACTIVE";
}

/** Obrigatórios: `usaName` e `userId` (atendente); os restantes campos são opcionais. */
export interface CreateClientsDTO {
  companyId?: string;
  usaName: string;
  usaCpf?: string;
  usaPhone?: string;
  usaAddress?: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    zipCode: string;
    complemento: string;
  };
  brazilName?: string;
  brazilCpf?: string;
  brazilPhone?: string;
  brazilAddress?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
  };
  userId: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ClientHistoryItem {
  id: string;
  clientId: string;
  entityId: string | null;
  entityType: string | null;
  actionType: string | null;
  message: string;
  owner: { id: string; name: string };
  createdAt: string;
}

export interface HistoryPagination {
  data: ClientHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Resposta de `POST /clients/import` (planilha Controle de Entregas). */
export interface ClientsImportResult {
  created: number;
  skipped: number;
  failed: number;
  totalRows: number;
  errors: Array<{ sheet: string; row: number; message: string }>;
}

export interface ClientBackend {
  id: string;
  companyId: string;
  usaName: string;
  usaCpf: string | null;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  brazilName: string;
  brazilCpf: string | null;
  brazilPhone: string;
  brazilAddress: Record<string, unknown>;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  user?: { id: string; name: string };
}
