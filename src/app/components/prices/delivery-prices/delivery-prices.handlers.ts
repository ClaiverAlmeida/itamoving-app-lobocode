import React from "react";
import { toast } from "sonner";
import { exportDocument } from "../../../utils";
import type { PrecoEntrega } from "../../../api";
import type { DeliveryPriceForm } from "./delivery-prices.types";
import { buildCreateDeliveryPayload, buildUpdateDeliveryPatch } from "./delivery-prices.payload";
import { createDeliveryPrice, deleteDeliveryPrice, exportDeliveryPrices, updateDeliveryPrice } from "./delivery-prices.crud";

export async function handleCreateDeliverySubmit(params: {
  e: React.FormEvent;
  form: DeliveryPriceForm;
  setIsEntregaDialogOpen: (open: boolean) => void;
  setSelectedEntrega: (p: PrecoEntrega | null) => void;
  resetFormEntrega: () => void;
  setPageEntrega: (n: number) => void;
  carregarPrecosEntrega: (page: number) => Promise<void>;
}) {
  const {
    e,
    form,
    setIsEntregaDialogOpen,
    setSelectedEntrega,
    resetFormEntrega,
    setPageEntrega,
    carregarPrecosEntrega,
  } = params;

  e.preventDefault();
  const payload = buildCreateDeliveryPayload(form);

  const result = await createDeliveryPrice(payload);
  if (!result.success) {
    toast.error(result.error ?? "Erro ao cadastrar preço de entrega.");
    return;
  }

  toast.success("Preço de entrega cadastrado com sucesso!");
  resetFormEntrega();
  setSelectedEntrega(null);
  setIsEntregaDialogOpen(false);
  setPageEntrega(1);
  await carregarPrecosEntrega(1);
}

export async function handleEditDeliverySubmit(params: {
  e: React.FormEvent;
  form: DeliveryPriceForm;
  selectedEntrega: PrecoEntrega | null;
  setIsEditEntregaDialogOpen: (open: boolean) => void;
  setSelectedEntrega: (p: PrecoEntrega | null) => void;
  resetFormEntrega: () => void;
  pageEntrega: number;
  carregarPrecosEntrega: (page: number) => Promise<void>;
}) {
  const { e, form, selectedEntrega, setIsEditEntregaDialogOpen, setSelectedEntrega, resetFormEntrega, pageEntrega, carregarPrecosEntrega } = params;

  e.preventDefault();
  if (!selectedEntrega) return;

  const patchPayload = buildUpdateDeliveryPatch({ form, original: selectedEntrega });
  if (Object.keys(patchPayload).length === 0) {
    toast.info("Nenhum campo alterado.");
    return;
  }

  const result = await updateDeliveryPrice(selectedEntrega.id, patchPayload);

  if (result.success) {
    toast.success("Preço de entrega atualizado com sucesso!");
    resetFormEntrega();
    setIsEditEntregaDialogOpen(false);
    setSelectedEntrega(null);
    await carregarPrecosEntrega(pageEntrega);
  } else {
    toast.error(result.error || "Erro ao atualizar preço de entrega");
  }
}

export async function handleDeleteDelivery(params: {
  id: string;
  selectedEntrega: PrecoEntrega | null;
  setSelectedEntrega: (p: PrecoEntrega | null) => void;
  pageEntrega: number;
  carregarPrecosEntrega: (page: number) => Promise<void>;
  deletePrecoEntrega: (id: string) => void;
}) {
  const { id, selectedEntrega, setSelectedEntrega, pageEntrega, carregarPrecosEntrega, deletePrecoEntrega } = params;

  const confirm = window.confirm("Tem certeza que deseja excluir este preço de entrega?");
  if (!confirm) return;

  const result = await deleteDeliveryPrice(id);
  if (result.success) {
    deletePrecoEntrega(id);
    toast.success("Preço de entrega excluído com sucesso!");
    if (selectedEntrega?.id === id) setSelectedEntrega(null);
    await carregarPrecosEntrega(pageEntrega);
  } else {
    toast.error(result.error || "Erro ao excluir preço de entrega");
  }
}

export async function handleExportDeliveries(params?: { onDone?: () => void }) {
  const { onDone } = params ?? {};
  const result = await exportDeliveryPrices();

  if (result.success && result.data) {
    if (!result.data.length) {
      toast.error("Nenhum preço de entrega cadastrado");
      return result;
    }

    exportDocument.createPdf(result.data, "Delivery Prices", "Delivery prices list");
    toast.success("Preços de entrega exportados com sucesso");
    onDone?.();
    return result;
  }

  toast.error(result.error || "Erro ao exportar produtos");
  onDone?.();
  return result;
}

