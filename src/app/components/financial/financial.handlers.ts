import React from "react";
import { toast } from "sonner";
import type { Cliente, Transacao } from "../../api";
import type { TransactionFormData } from "./financial.types";
import { buildTransacaoFromFormData } from "./financial.payload";

export function handleNewTransactionSubmit(params: {
  e: React.FormEvent;
  formData: TransactionFormData;
  clientes: Cliente[];
  addTransacao: (t: Transacao) => void;
  resetForm: () => void;
  onClose: () => void;
}) {
  const { e, formData, clientes, addTransacao, resetForm, onClose } = params;
  e.preventDefault();

  const novaTransacao = buildTransacaoFromFormData({ formData, clientes });
  addTransacao(novaTransacao);
  toast.success("Transação registrada com sucesso!");
  resetForm();
  onClose();
}

export function handleDeleteTransaction(params: {
  id: string;
  deleteTransacao: (id: string) => void;
}) {
  const { id, deleteTransacao } = params;
  if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
  deleteTransacao(id);
  toast.success("Transação excluída!");
}

