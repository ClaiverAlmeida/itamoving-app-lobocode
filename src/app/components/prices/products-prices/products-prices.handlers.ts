import React from "react";
import { toast } from "sonner";
import type { ProductPrice } from "../../../api";
import type { ProductPriceForm } from "./products-prices.types";
import { buildCreateProductPayload, buildUpdateProductPatch } from "./products-prices.payload";
import {
  createProductPrice,
  deleteProductPrice as deleteProductPriceApi,
  exportProducts,
  updateProductPrice,
} from "./products-prices.crud";
import { exportDocument } from "../../../utils";

export async function handleCreateSubmit(params: {
  e: React.FormEvent;
  formProduto: ProductPriceForm;
  setIsProdutoDialogOpen: (open: boolean) => void;
  setIsEditProdutoDialogOpen: (open: boolean) => void;
  setSelectedProduto: (p: ProductPrice | null) => void;
  resetFormProduto: () => void;
  pageProduto: number;
  setPageProduto: (n: number) => void;
  carregarProdutos: (page: number) => Promise<void>;
}) {
  const {
    e,
    formProduto,
    setIsProdutoDialogOpen,
    resetFormProduto,
    carregarProdutos,
    setPageProduto,
    setSelectedProduto,
    setIsEditProdutoDialogOpen,
  } = params;
  e.preventDefault();

  const payload = buildCreateProductPayload(formProduto);
  const result = await createProductPrice(payload);

  if (!result.success) {
    toast.error(result.error ?? "Erro ao cadastrar produto.");
    return;
  }

  toast.success("Produto cadastrado com sucesso!");
  resetFormProduto();
  setIsProdutoDialogOpen(false);
  setSelectedProduto(null);
  setIsEditProdutoDialogOpen(false);
  setPageProduto(1);
  await carregarProdutos(1);
}

export async function handleEditSubmit(params: {
  e: React.FormEvent;
  formProduto: ProductPriceForm;
  selectedProduto: ProductPrice | null;
  setIsEditProdutoDialogOpen: (open: boolean) => void;
  setSelectedProduto: (p: ProductPrice | null) => void;
  resetFormProduto: () => void;
  pageProduto: number;
  carregarProdutos: (page: number) => Promise<void>;
}) {
  const { e, formProduto, selectedProduto, setIsEditProdutoDialogOpen, resetFormProduto, carregarProdutos, pageProduto, setSelectedProduto } = params;
  e.preventDefault();
  if (!selectedProduto) return;

  const patchPayload = buildUpdateProductPatch({ form: formProduto, original: selectedProduto });
  if (Object.keys(patchPayload).length === 0) {
    toast.info("Nenhum campo alterado.");
    return;
  }

  const result = await updateProductPrice(selectedProduto.id, patchPayload);

  if (result.success) {
    toast.success("Produto atualizado com sucesso!");
    resetFormProduto();
    setIsEditProdutoDialogOpen(false);
    setSelectedProduto(null);
    await carregarProdutos(pageProduto);
  } else {
    toast.error(result.error || "Erro ao atualizar produto");
  }
}

export async function handleDelete(params: {
  id: string;
  selectedProduto: ProductPrice | null;
  setSelectedProduto: (p: ProductPrice | null) => void;
  pageProduto: number;
  carregarProdutos: (page: number) => Promise<void>;
  deleteProductPrice: (id: string) => void;
}) {
  const { id, selectedProduto, setSelectedProduto, pageProduto, carregarProdutos, deleteProductPrice } = params;

  const result = await deleteProductPriceApi(id);

  if (result.success) {
    deleteProductPrice(id);
    toast.success("Produto excluído com sucesso!");
    if (selectedProduto?.id === id) setSelectedProduto(null);
    await carregarProdutos(pageProduto);
  } else {
    toast.error(result.error || "Erro ao excluir produto");
  }
}

export async function handleExport(params: { onDone?: () => void }) {
  const { onDone } = params;
  const result = await exportProducts();

  if (result.success && result.data) {
    if (!result.data.length) {
      toast.error("Nenhum produto cadastrado");
      return result;
    }

    // exportDocument.createPdf(result.data, "Products", "Products list");
    // toast.success("Produtos exportados com sucesso");
    onDone?.();
    return result;
  }

  toast.error(result.error || "Erro ao exportar produtos");
  onDone?.();
  return result;
}

