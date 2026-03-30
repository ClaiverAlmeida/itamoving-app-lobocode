import { clientsService, type FinancialTransaction } from "../../api";

export function createFinancialCrud(params: {
  addTransacao: (t: FinancialTransaction) => void;
  deleteTransacao: (id: string) => void;
}) {
  return {
    create: (transacao: FinancialTransaction) => params.addTransacao(transacao),
    remove: (id: string) => params.deleteTransacao(id),
  };
}

export const financialCrud = {
  // create: (transacao: FinancialTransaction) => financialService.create(transacao),
};

export const clientsCrud = {
  getAll: () => clientsService.getAll(),
};