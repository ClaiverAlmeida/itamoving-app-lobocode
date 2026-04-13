import type { DeliveryPriceForm } from "./delivery-prices.types";
import { DELIVERY_PRICE_FORM_INITIAL } from "./delivery-prices.constants";

export function resetDeliveryForm(): DeliveryPriceForm {
  // Evita manter referência no estado.
  return { ...DELIVERY_PRICE_FORM_INITIAL };
}

export function parseMoneyInputToNumber(val: string): number {
  // Suporta vírgula decimal.
  return parseFloat(String(val).replace(",", ".")) || 0;
}

export function parseIntInputToNumber(val: string): number {
  return parseInt(String(val), 10) || 0;
}

