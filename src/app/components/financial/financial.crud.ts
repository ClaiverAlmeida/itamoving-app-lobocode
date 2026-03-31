import { clientsService, CreateFinancialTransactionDTO, financialTransactionService } from "../../api";
import { UpdateFinancialTransactionDTO } from "../../api/types/financial";

export const financialTransactionCrud = {
  getAll: () => financialTransactionService.getAll(),
  create: (transacao: CreateFinancialTransactionDTO) => financialTransactionService.create(transacao),
  update: (id: string, transacao: UpdateFinancialTransactionDTO) => financialTransactionService.update(id, transacao),
  delete: (id: string) => financialTransactionService.delete(id),
};

export const clientsCrud = {
  getAll: () => clientsService.getAll(),
};