import React from "react";
import { toast } from "sonner";
import type { Client, FinancialTransaction } from "../../api";
import type { TransactionFormData } from "./index";
import { buildTransacaoFromFormData } from "./index";

export async function handleNewTransactionSubmit(params: {
  e: React.FormEvent;
  formData: TransactionFormData;
  clientes: Client[];
  addTransacao: (t: FinancialTransaction) => Promise<boolean>;
  resetForm: () => void;
  onClose: () => void;
}) {
  const { e, formData, clientes, addTransacao, resetForm, onClose } = params;
  e.preventDefault();

  if(formData.type === "REVENUE" && !formData.clientId) {
    toast.error("Selecione um cliente para registrar a transação.");
    return;
  }

  if(!formData.paymentMethod) {
    toast.error("Selecione um método de pagamento para registrar a transação.");
    return;
  }

  if(!formData.category) {
    toast.error("Selecione uma categoria para registrar a transação.");
    return;
  }

  if(!formData.date) {
    toast.error("Informe a data da transação.");
    return;
  }

  const novaTransacao = buildTransacaoFromFormData({ formData, clientes });
  const ok = await addTransacao(novaTransacao);
  if (!ok) return;

  toast.success("Transação registrada com sucesso!");
  resetForm();
  onClose();
}

export async function handleDeleteTransaction(params: {
  id: string;
  deleteTransacao: (id: string) => Promise<boolean>;
}) {
  const { id, deleteTransacao } = params;

  if(!id) {
    toast.error("Selecione uma transação para excluir.");
    return;
  }

  const ok = await deleteTransacao(id);
  if (ok) toast.success("Transação excluída!");
}

