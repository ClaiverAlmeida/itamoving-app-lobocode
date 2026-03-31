export interface FinancialTransaction {
  id?: string;
  /** Receitas costumam ter cliente; despesas não enviam estes campos. */
  clientId?: string;
  clientName?: string;
  type: "REVENUE" | "EXPENSE";
  category: string;
  value: number;
  date: string;
  description: string | undefined;
  paymentMethod: string;
}

export interface CreateFinancialTransactionDTO {
  clientId?: string;
  type: "REVENUE" | "EXPENSE";
  category: string;
  value: number;
  date: string;
  description: string | undefined;
  paymentMethod: string;
}

export interface FinancialTransactionBackend {
  id: string;
  client?: {
    id: string;
    usaName?: string;
    usaAddress?: {
      cidade: string;
      estado: string;
    };
  }
  type: "REVENUE" | "EXPENSE";
  category: string;
  value: number;
  date: string;
  description?: string | undefined;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
