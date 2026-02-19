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
  registeredAt: string;
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
    dataCadastro: client.registeredAt,
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
      const result = await api.post<{ data: Cliente }>("/clients", data);

      if (result.success && result.data) {
        const response = result.data as any;
        const clientData = response.data || response;
        return { success: true, data: clientData };
      }

      return { success: false, error: "Erro ao criar cliente" };
    } catch (error) {
      return { success: false, error: "Erro ao criar cliente" };
    }
  }
}

export const clientsService = new ClientsService();
