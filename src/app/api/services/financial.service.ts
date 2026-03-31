import { BaseCrudService } from "./base-crud.service";
import {
    CreateFinancialTransactionDTO,
    FinancialTransaction,
    FinancialTransactionBackend,
} from "../interfaces";
import { UpdateFinancialTransactionDTO } from "../types/financial";
import { toDateOnly } from "../../utils/date";

function pickClientDisplayName(client?: FinancialTransactionBackend["client"]): string | undefined {
    if (!client) return undefined;
    const usa = client.usaName?.trim();
    if (usa) return usa;
    return undefined;
}

function mapBackendToFrontend(row: FinancialTransactionBackend): FinancialTransaction {
    const rawVal = row.value;
    const num = typeof rawVal === "number" ? rawVal : Number(rawVal);

    return {
        id: row.id,
        clientId: row.client?.id ?? undefined,
        clientName: pickClientDisplayName(row.client),
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
