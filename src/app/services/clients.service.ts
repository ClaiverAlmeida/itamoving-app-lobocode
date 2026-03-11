import { api } from "./api.service";
import { Cliente } from "../types";

/**
 * DTO para criar um novo cliente (payload para o backend)
 * Alinhado com CreateClientsDto do backend
 */
export interface CreateClientsDTO {
  companyId?: string;
  usaName: string;
  usaCpf: string;
  usaPhone: string;
  usaAddress: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    zipCode: string;
    complemento: string;
  };
  brazilName: string;
  brazilCpf: string;
  brazilPhone: string;
  brazilAddress: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
  };
  userId: string;
  status?: "ACTIVE" | "INACTIVE";
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
  owner: {
    id: string;
    name: string;
  };
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
  
  usaName: string;
  usaCpf: string;
  usaPhone: string;
  usaAddress: Record<string, unknown>;
  
  brazilName: string;
  brazilCpf: string;
  brazilPhone: string;
  brazilAddress: Record<string, unknown>;
  
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  /** Atendente (vindo do backend com include da relação user) */
  user?: {
    id: string;
    name: string;
  };
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

  // Mapeia brazilDestination (JSON) para enderecoBrasil estruturado
  const brazilAddress = client.brazilAddress as any;
  const enderecoBrasil = {
    rua: brazilAddress?.rua || brazilAddress?.street || brazilAddress?.address || "",
    numero: brazilAddress?.numero || brazilAddress?.number || brazilAddress?.num || "",
    cidade: brazilAddress?.cidade || brazilAddress?.city || "",
    estado: brazilAddress?.estado || brazilAddress?.state || "",
    cep: brazilAddress?.cep || "",
    complemento: brazilAddress?.complemento || brazilAddress?.complement || "",
  };

  const userId = client.user?.id ?? (client as { userId?: string }).userId ?? "";
  const userName = client.user?.name ?? "";
  const user = { id: userId, name: userName };

  return {
    id: client.id,
    usaNome: client.usaName,
    usaCpf: client.usaCpf,
    usaPhone: client.usaPhone,
    usaAddress: enderecoUSA,
    brazilNome: client.brazilName,
    brazilCpf: client.brazilCpf,
    brazilPhone: client.brazilPhone,
    brazilAddress: enderecoBrasil,
    user,
    dataCadastro: client.createdAt,
    status: client.status,
  };
}

export class ClientsService {
  async getAll(): Promise<{
    success: boolean;
    data?: { data: Cliente[] };
    error?: string;
  }> {
    try {
      const result = await api.get<ClientBackend[]>("/clients");
      if (result.success && result.data) {
        // O backend retorna um array diretamente, então result.data já é o array
        let dataArray: ClientBackend[] = [];

        if (Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result.data && typeof result.data === "object") {
          // Caso o backend retorne um objeto com propriedade data
          dataArray = (result.data as any).data || [];
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
        error: result.error || "Erro ao buscar clientes",
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
      const result = await api.post<ClientBackend | { data: ClientBackend }>(
        "/clients",
        data,
      );

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const clientBackend = raw as ClientBackend;
        const cliente = mapBackendToFrontend(clientBackend);
        return { success: true, data: cliente };
      }

      return { success: false, error: result.error || "Erro ao criar cliente" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao criar cliente" };
    }
  }

  async update(
    id: string,
    data: UpdateClientsDTO,
    changes?: Record<string, { before?: unknown; after?: unknown }>,
  ): Promise<{ success: boolean; data?: Cliente; error?: string }> {
    try {
      const body = changes ? { data, changes } : { data };
      const result = await api.patch<ClientBackend | { data: ClientBackend }>(
        `/clients/${id}`,
        body,
      );

      if (result.success && result.data) {
        const raw = (result.data as any)?.data ?? result.data;
        const clientBackend = raw as ClientBackend;
        const cliente = mapBackendToFrontend(clientBackend);
        return { success: true, data: cliente };
      }

      return { success: false, error: result.error || "Erro ao atualizar cliente" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao atualizar cliente" };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete<{ data: Cliente }>(`/clients/${id}`);

      if (result.success && result.data) {
        return { success: true };
      }

      return { success: false, error: result.error || "Erro ao deletar cliente" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao deletar cliente" };
    }
  }

  async export(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const result = await api.get<string>("/clients/export");
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao exportar clientes" };
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
      return { success: false, error: error.message || "Erro ao buscar histórico de clientes" };
    }
  }
}

export const clientsService = new ClientsService();
