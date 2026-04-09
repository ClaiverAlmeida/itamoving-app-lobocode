import type { CriarMovimentacao, EstoqueAtualizado } from "../../api";
import type { ItemKeyEn, MovementDialogType } from "./stock.types";
import { ITEM_KEY_TO_PRODUCT_TYPE } from "./stock.constants";

export function buildEstoqueAtualizadoPayload(selectedItem: ItemKeyEn, quantidade: number): EstoqueAtualizado {
  return {
    [selectedItem]: quantidade,
  };
}

export function buildMovimentacaoPayload(args: {
  type: MovementDialogType;
  selectedItem: ItemKeyEn;
  quantidade: number;
  responsavel: string;
  observacao: string;
  selectedProduto: string;
}): CriarMovimentacao | null {
  const { type, selectedItem, quantidade, responsavel, observacao, selectedProduto } = args;
  const productType = ITEM_KEY_TO_PRODUCT_TYPE[selectedItem];
  if (!productType) return null;
  return {
    type,
    productType,
    quantity: quantidade,
    userId: responsavel,
    observations: observacao,
    productId: selectedProduto,
  };
}

