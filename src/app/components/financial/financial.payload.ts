import type { Cliente, Transacao } from "../../api";
import type { TransactionFormData } from "./financial.types";

export function buildTransacaoFromFormData(params: {
  formData: TransactionFormData;
  clientes: Cliente[];
}): Transacao {
  const { formData, clientes } = params;
  const cliente = clientes.find((c) => c.id === formData.clienteId);

  const valor = Number.parseFloat(formData.valor);

  return {
    id: Date.now().toString(),
    clienteId: formData.clienteId,
    clienteNome: cliente?.usaNome || "N/A",
    tipo: formData.tipo,
    categoria: formData.categoria,
    valor: Number.isFinite(valor) ? valor : 0,
    data: formData.data,
    descricao: formData.descricao,
    metodoPagamento: formData.metodoPagamento,
  };
}

