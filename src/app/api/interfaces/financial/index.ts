export interface FinancialTransaction {
  id?: string;
  clientId: string;
  clientName: string;
  type: "REVENUE" | "EXPENSE";
  category: string;
  value: number;
  date: string;
  description: string;
  paymentMethod: string;
}

export interface CreateFinancialTransactionDTO {
  clientId: string;
  clientName: string;
  type: "REVENUE" | "EXPENSE";
  category: string;
  value: number;
  date: string;
  description: string;
  paymentMethod: string;
}