import { BaseCrudService } from "./base-crud.service";
import {
    CreateFinancialTransactionDTO,
    FinancialTransaction,
    FinancialTransactionBackend,
} from "../interfaces";
import { UpdateFinancialTransactionDTO } from "../types/financial";
import { toDateOnly } from "../../utils/date";

function mapBackendToFrontend(row: FinancialTransactionBackend): FinancialTransaction {
    const rawVal = row.value;
    const num = typeof rawVal === "number" ? rawVal : Number(rawVal);

    return {
        id: row.id,
        clientId: row.client?.id ?? undefined,
        clientName: row.client?.usaName ?? undefined,
        type: row.type,
        category: row.category,
        value: Number.isFinite(num) ? num : 0,
        date: toDateOnly(row.date),
        description: row.description,
        paymentMethod: row.paymentMethod,
    };
}

export class FinancialTransactionService extends BaseCrudService<
    FinancialTransaction,
    FinancialTransactionBackend,
    CreateFinancialTransactionDTO,
    UpdateFinancialTransactionDTO
> {
    constructor() {
        super("/financial-transaction", mapBackendToFrontend, {
            listError: "Erro ao buscar transações financeiras",
            createError: "Erro ao criar transações financeiras",
            updateError: "Erro ao atualizar transações financeiras",
            deleteError: "Erro ao deletar transações financeiras",
        });
    }
}

export const financialTransactionService = new FinancialTransactionService();
