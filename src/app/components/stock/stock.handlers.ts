import type { EstoqueMovimentacao, ItemKeyEn, MovementDialogType } from "./stock.types";
import { buildEstoqueAtualizadoPayload, buildMovimentacaoPayload } from "./stock.payload";
import { Estoque, EstoqueAtualizado } from "../../api";

type HandleMovementArgs = {
  selectedItem: ItemKeyEn | "";
  quantidade: number;
  responsavel: string;
  selectedProduto: string;
  observacao: string;
  dialogType: MovementDialogType;
  estoqueAtual: Record<string, number>;
  idStock: string | null;
  updateEstoque: (data: Record<string, number>) => void;
  updateStockRemote: (idStock: string, payload: Record<string, number>, movementPayload: any, type: MovementDialogType) => Promise<{ success: boolean; data?: { stockMovements?: EstoqueMovimentacao[] }; error?: string }>;
  setMovimentacoes: (list: EstoqueMovimentacao[]) => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export async function handleStockMovement(args: HandleMovementArgs) {
  const {
    selectedItem,
    quantidade,
    responsavel,
    selectedProduto,
    observacao,
    dialogType,
    estoqueAtual,
    idStock,
    updateEstoque,
    updateStockRemote,
    setMovimentacoes,
    onSuccess,
    onError,
  } = args;

  if (!selectedItem || quantidade <= 0 || !responsavel || !selectedProduto) {
    onError("Preencha todos os campos obrigatórios");
    return;
  }

  const estoqueItemAtual = Number(estoqueAtual[selectedItem] ?? 0);
  if (dialogType === "EXIT" && estoqueItemAtual < quantidade) {
    onError("Estoque insuficiente");
    return;
  }

  if (!idStock) {
    onError("Estoque não carregado");
    return;
  }

  const novoValor = dialogType === "ENTRY" ? estoqueItemAtual + quantidade : estoqueItemAtual - quantidade;
  updateEstoque({ [selectedItem]: novoValor });

  const atualizarEstoque = buildEstoqueAtualizadoPayload(selectedItem, quantidade);
  const movimentacaoPayload = buildMovimentacaoPayload({
    type: dialogType,
    selectedItem,
    quantidade,
    responsavel,
    observacao,
    selectedProduto,
  });

  if (!movimentacaoPayload) {
    onError("Tipo de produto inválido");
    return;
  }

  const result = await updateStockRemote(idStock, atualizarEstoque, movimentacaoPayload, dialogType);
  if (!result.success) {
    onError(result.error || "Erro ao atualizar estoque");
    return;
  }

  if (result.data?.stockMovements) {
    setMovimentacoes(result.data.stockMovements);
  }

  onSuccess();
}

