import { api } from "./api.service";
import { BaseCrudService } from "./base-crud.service";
import type { CriarMovimentacao, Estoque, EstoqueAtualizado, EstoqueBackend } from "../types";

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

export class StockService extends BaseCrudService<
  Estoque,
  EstoqueBackend,
  EstoqueAtualizado,
  EstoqueAtualizado
> {
  constructor() {
    super("/stock", mapBackendToFrontend, {
      listError: "Erro ao buscar estoque",
      updateError: "Erro ao atualizar estoque",
    });
  }

  async update(
    id: string,
    atualizarEstoque: EstoqueAtualizado,
    novaMovimentacao?: CriarMovimentacao,
    type: "ENTRY" | "EXIT" = "ENTRY",
  ): Promise<{ success: boolean; data?: Estoque; error?: string }> {
    if (!novaMovimentacao) {
      return super.update(id, atualizarEstoque);
    }

    try {
      const operation = type === "ENTRY" ? "increment" : "decrement";
      const body = { stock: atualizarEstoque, movement: novaMovimentacao };
      const result = await api.patch<EstoqueBackend | { data: EstoqueBackend }>(
        `/stock/${operation}/${id}`,
        body,
      );

      if (result.success && result.data) {
        const raw = this.unwrapData(result.data);
        if (!raw) return { success: false, error: "Erro ao atualizar estoque" };
        return { success: true, data: mapBackendToFrontend(raw as EstoqueBackend) };
      }
      return { success: false, error: result.error || "Erro ao atualizar estoque" };
    } catch (error) {
      return { success: false, error: error.message || "Erro ao atualizar estoque" };
    }
  }
}

export const stockService = new StockService();
