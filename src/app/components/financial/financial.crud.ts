import { clientsService, type Transacao } from "../../api";

export function createFinancialCrud(params: {
  addTransacao: (t: Transacao) => void;
  deleteTransacao: (id: string) => void;
}) {
  return {
    create: (transacao: Transacao) => params.addTransacao(transacao),
    remove: (id: string) => params.deleteTransacao(id),
  };
}

export const financialCrud = {
  getClients: () => clientsService.getAll(),
};