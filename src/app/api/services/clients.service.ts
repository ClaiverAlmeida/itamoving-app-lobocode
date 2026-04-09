import { api } from "./api.service";
import type { Client } from "../types";
import { BaseCrudService } from "./base-crud.service";
import type {
  ClientBackend,
  ClientsImportResult,
  CreateClientsDTO,
  HistoryPagination,
  UpdateClientsDTO,
} from "../types";

/** Normaliza JSON de endereços e CPFs opcionais; escalares iguais ao backend (`usaName`, `brazilName`, `createdAt`, …). */
function mapBackendToFrontend(client: ClientBackend): Client {
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
    bairro: brazilAddress?.bairro || brazilAddress?.neighborhood || "",
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
    usaName: client.usaName ?? "",
    usaCpf: client.usaCpf ?? "",
    usaPhone: client.usaPhone ?? "",
    usaAddress: enderecoUSA,
    brazilName: client.brazilName ?? "",
    brazilCpf: client.brazilCpf ?? "",
    brazilPhone: client.brazilPhone ?? "",
    brazilAddress: enderecoBrasil,
    user,
    createdAt: client.createdAt,
    status: client.status,
  };
}

export class ClientsService extends BaseCrudService<
  Client,
  ClientBackend,
  CreateClientsDTO,
  UpdateClientsDTO
> {
  constructor() {
    super("/clients", mapBackendToFrontend, {
      listError: "Erro ao buscar clientes",
      createError: "Erro ao criar cliente",
      updateError: "Erro ao atualizar cliente",
      deleteError: "Erro ao deletar cliente",
    });
  }

  /**
   * Lista completa para o app (a rota `GET /clients` usa paginação padrão e devolve só 10 itens).
   */
  async getAll(): Promise<{ success: boolean; data?: Client[]; error?: string }> {
    const result = await api.get<ClientBackend[] | { data: ClientBackend[] }>(
      `${this.resource}/all`,
    );
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.listError };
    }
    const items = this.unwrapList(result.data);
    return { success: true, data: items.map(this.mapBackendToFrontend) };
  }

  async update(
    id: string,
    data: UpdateClientsDTO,
    changes?: Record<string, { before?: unknown; after?: unknown }>,
  ): Promise<{ success: boolean; data?: Client; error?: string }> {
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

  async export(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const result = await api.get<string>("/clients/export");
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao exportar clientes" };
    }
  }

  /** Histórico do cliente com paginação (7 itens por página) */
  async importClients(
    file: File,
  ): Promise<{ success: boolean; data?: ClientsImportResult; error?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return api.postFormData<ClientsImportResult>("/clients/import", formData);
  }

  async history(
    clientId: string,
    page = 1,
    limit = 10,
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
