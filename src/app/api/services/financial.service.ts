import { BaseCrudService } from "./base-crud.service";
import { FinancialTransaction } from "../interfaces";

// import type {
//   CreateDeliveryPriceDTO,
//   DeliveryPriceBackend,
//   DeliveryPricesPagination,
//   UpdateDeliveryPriceEntregaDTO,
// } from "../../types";

// function mapBackendToFrontend(financialTransaction: FinancialTransactionBackend): FinancialTransaction {
//   return {

//   };
// }

// export class FinancialTransactionService extends BaseCrudService<
//   PrecoEntrega,
//   DeliveryPriceBackend,
//   CreateDeliveryPriceDTO,
//   UpdateDeliveryPriceEntregaDTO,
//   DeliveryPricesPagination
// > {
//   constructor() {
//     super("/financial-transaction", mapBackendToFrontend, {
//       listError: "Erro ao buscar transações financeiras",
//       createError: "Erro ao criar transações financeiras",
//       updateError: "Erro ao atualizar transações financeiras",
//       deleteError: "Erro ao deletar transações financeiras",
//     }, true);
//   }
//   }

// export const financialTransactionService = new FinancialTransactionService();
