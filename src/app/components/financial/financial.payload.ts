import type { Client, FinancialTransaction } from "../../api";
import type { TransactionFormData } from "./index";

export function buildTransacaoFromFormData(params: {
  formData: TransactionFormData;
  clientes: Client[];
}): FinancialTransaction {
  const { formData, clientes } = params;
  const cliente = clientes.find((c) => c.id === formData.clientId);

  const value = Number.parseFloat(formData.value);

  return {
    clientId: formData.clientId,
    clientName: cliente?.usaNome || "N/A",
    type: formData.type,
    category: formData.category,
    value: Number.isFinite(value) ? value : 0,
    date: formData.date,
    description: formData.description,
    paymentMethod: formData.paymentMethod,
  };
}

