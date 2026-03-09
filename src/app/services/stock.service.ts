import { api } from "./api.service";

export interface Estoque {
  id: string;
  smallBoxes?: number;
  mediumBoxes?: number;
  largeBoxes?: number;
  personalizedItems?: number;
  adhesiveTape?: number;
  stockMovements?: EstoqueMovimentacao[];
}

export interface EstoqueAtualizado {
  smallBoxes?: number;
  mediumBoxes?: number;
  largeBoxes?: number;
  personalizedItems?: number;
  adhesiveTape?: number;
}

export interface EstoqueMovimentacao {
  id: string;
  type: "ENTRY" | "EXIT";
  productType:
    | "SMALL_BOX"
    | "MEDIUM_BOX"
    | "LARGE_BOX"
    | "PERSONALIZED_ITEM"
    | "TAPE_ADHESIVE";
  quantity: number;
  observations?: string;
  createdAt: string;
  productId: string;
  product: {
    id: string;
    name: string;
    type: string;
  };
  user: {
    id: string;
    name: string;
    role: "DRIVER";
  };
}

export interface CriarMovimentacao {
  type: "ENTRY" | "EXIT";
  productType:
    | "SMALL_BOX"
    | "MEDIUM_BOX"
    | "LARGE_BOX"
    | "PERSONALIZED_ITEM"
    | "TAPE_ADHESIVE";
  quantity: number;
  userId: string;
  observations?: string;
  productId: string;
}

export interface EstoqueBackend {
  id: string;
  companyId: string;
  smallBoxes: number;
  mediumBoxes: number;
  largeBoxes: number;
  adhesiveTape: number;
  personalizedItems: number;
  createdAt: string;
  stockMovements: EstoqueMovimentacao[];
}

function mapBackendToFrontend(stock: EstoqueBackend): Estoque {
  return {
    id: stock.id,
    smallBoxes: stock.smallBoxes,
    mediumBoxes: stock.mediumBoxes,
    largeBoxes: stock.largeBoxes,
    adhesiveTape: stock.adhesiveTape,
    personalizedItems: stock.personalizedItems,
    stockMovements: stock.stockMovements,
  };
}

export class StockService {
  async getAll(): Promise<{
    success: boolean;
    data?: { data: Estoque[] };
    error?: string;
  }> {
    try {
      const result = await api.get<EstoqueBackend[]>("/stock");
      if (result.success && result.data) {
        let dataArray: EstoqueBackend[] = [];

        if (Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result.data && typeof result.data === "object") {
          dataArray = (result.data as any).data || [];
        }
        const estoqueMapeados = dataArray.map(mapBackendToFrontend);
        return {
          success: true,
          data: { data: estoqueMapeados },
        };
      }
      return {
        success: false,
        error: result.error || "Erro ao buscar estoque",
      };
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      return {
        success: false,
        error: "Erro ao buscar estoque",
      };
    }
  }

  async update(
    id: string,
    atualizarEstoque: EstoqueAtualizado,
    novaMovimentacao: CriarMovimentacao,
    type: "ENTRY" | "EXIT",
  ): Promise<{ success: boolean; data?: Estoque; error?: string }> {
    try {
      const operation = type === "ENTRY" ? "increment" : "decrement";
      const body = { stock: atualizarEstoque, movement: novaMovimentacao };
      const result = await api.patch<EstoqueBackend | { data: EstoqueBackend }>(
        `/stock/${operation}/${id}`,
        body,
      );

      if (result.success && result.data) {
        return { success: true, data: result.data as Estoque };
      }
      return { success: false, error: "Erro ao atualizar estoque" };
    } catch (error) {
      return { success: false, error: "Erro ao atualizar estoque" };
    }
  }
}

export const stockService = new StockService();
