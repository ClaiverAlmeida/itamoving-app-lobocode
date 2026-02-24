import { api } from "./api.service";
import { Cliente } from "../types";

/**
 * DTO para criar um novo cliente (payload para o backend)
 * Alinhado com CreateClientsDto do backend
 */
export interface CreateClientsDTO {
  companyId?: string;
  name: string;
  cpf: string;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  brazilDestination: Record<string, unknown>;
  attendant: string;
  status?: 'active' | 'inactive';
}

/** DTO para edição (PATCH) - apenas campos enviados são atualizados */
export type UpdateClientsDTO = Partial<CreateClientsDTO>;

/**
 * Item de histórico do cliente (ClientHistory do backend)
 */
export interface ClientHistoryItem {
  id: string;
  clientId: string;
  entityId: string | null;
  entityType: string | null;
  actionType: string | null;
  message: string;
  ownerId: string;
  fieldsChanged?: Record<string, { before?: unknown; after?: unknown }>;
  createdAt: string;
}

/** Resposta paginada do histórico do cliente */
export interface HistoryPagination {
  data: ClientHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface que representa os dados do Cliente retornados pelo backend
 */
export interface ClientBackend {
  id: string;
  companyId: string;
  name: string;
  cpf: string;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  brazilDestination: Record<string, unknown>;
  attendant: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

/**
 * Mapeia os dados do backend para o formato do frontend
 */
function mapBackendToFrontend(client: ClientBackend): Cliente {
  // Mapeia usaAddress (JSON) para enderecoUSA estruturado
  const usaAddress = client.usaAddress as any;
  const enderecoUSA = {
    rua: usaAddress?.rua || usaAddress?.street || usaAddress?.address || "",
    numero: usaAddress?.numero || usaAddress?.number || usaAddress?.num || "",
    cidade: usaAddress?.cidade || usaAddress?.city || "",
    estado: usaAddress?.estado || usaAddress?.state || "",
    zipCode:
      usaAddress?.zipCode || usaAddress?.zip || usaAddress?.postalCode || "",
    complemento:
      usaAddress?.complemento ||
      usaAddress?.complement ||
      usaAddress?.complemento ||
      undefined,
  };

  // Mapeia brazilDestination (JSON) para destinoBrasil estruturado
  const brazilDest = client.brazilDestination as any;
  const destinoBrasil = {
    nomeRecebedor:
      brazilDest?.nomeRecebedor ||
      brazilDest?.nome ||
      brazilDest?.receiverName ||
      "",
    cpfRecebedor:
      brazilDest?.cpfRecebedor ||
      brazilDest?.cpf ||
      brazilDest?.receiverCpf ||
      "",
    endereco:
      brazilDest?.endereco || brazilDest?.address || brazilDest?.rua || "",
    cidade: brazilDest?.cidade || brazilDest?.city || "",
    estado: brazilDest?.estado || brazilDest?.state || "",
    cep: brazilDest?.cep || brazilDest?.postalCode || "",
    telefones: Array.isArray(brazilDest?.telefones)
      ? brazilDest.telefones
      : brazilDest?.telefone
        ? [brazilDest.telefone]
        : [],
  };

  return {
    id: client.id,
    nome: client.name,
    cpf: client.cpf,
    telefoneUSA: client.usaPhone,
    enderecoUSA,
    destinoBrasil,
    atendente: client.attendant,
    dataCadastro: client.createdAt,
    status: client.status === "active" ? "ativo" : "inativo",
  };
}

export class ClientsService {
  async getAll(): Promise<{
    success: boolean;
    data?: { data: Cliente[] };
    error?: string;
  }> {
    try {
      const response = await api.get<ClientBackend[]>("/clients");
      if (response.success && response.data) {
        // O backend retorna um array diretamente, então response.data já é o array
        let dataArray: ClientBackend[] = [];

        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === "object") {
          // Caso o backend retorne um objeto com propriedade data
          dataArray = (response.data as any).data || [];
        }

        // Mapeia cada cliente do backend para o formato do frontend
        const clientesMapeados = dataArray.map(mapBackendToFrontend);
        return {
          success: true,
          data: { data: clientesMapeados },
        };
      }
      return {
        success: false,
        error: response.error || "Erro ao buscar clientes",
      };
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return {
        success: false,
        error: "Erro ao buscar clientes",
      };
    }
  }

  async create(
    data: CreateClientsDTO,
  ): Promise<{ success: boolean; data?: Cliente; error?: string }> {
    try {
      const result = await api.post<ClientBackend | { data: ClientBackend }>("/clients", data);

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const clientBackend = raw as ClientBackend;
        const cliente = mapBackendToFrontend(clientBackend);
        return { success: true, data: cliente };
      }

      return { success: false, error: "Erro ao criar cliente" };
    } catch (error) {
      return { success: false, error: "Erro ao criar cliente" };
    }
  }

  async update(
    id: string,
    data: UpdateClientsDTO,
    changes?: Record<string, { before?: unknown; after?: unknown }>,
  ): Promise<{ success: boolean; data?: Cliente; error?: string }> {
    try {
      const body = changes ? { data, changes } : { data };
      const result = await api.patch<ClientBackend | { data: ClientBackend }>(`/clients/${id}`, body);

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const clientBackend = raw as ClientBackend;
        const cliente = mapBackendToFrontend(clientBackend);
        return { success: true, data: cliente };
      }

      return { success: false, error: "Erro ao atualizar cliente" };
    } catch (error) {
      return { success: false, error: "Erro ao atualizar cliente" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete<{ data: Cliente }>(`/clients/${id}`);

      if(result.success && result.data) {
        return { success: true };
      }

      return { success: false, error: "Erro ao deletar cliente" };
    } catch (error) {
      return { success: false, error: "Erro ao deletar cliente" };
    }
  }

  async export(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const result = await api.get<string>("/clients/export");
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Erro ao exportar clientes" };
    }
  }

  /** Histórico do cliente com paginação (7 itens por página) */
  async history(
    clientId: string,
    page = 1,
    limit = 5,
  ): Promise<{
    success: boolean;
    data?: HistoryPagination;
    error?: string;
  }> {
    try {
      const result = await api.get<HistoryPagination>(
        `/clients/history/${clientId}`,
        { params: { page, limit } },
      );
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Erro ao buscar histórico de clientes" };
    }
  }
}

export const clientsService = new ClientsService();
