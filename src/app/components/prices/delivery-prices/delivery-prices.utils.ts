import type { DeliveryPriceForm } from "./delivery-prices.types";
import { DELIVERY_PRICE_FORM_INITIAL } from "./delivery-prices.constants";
import { BRASIL_STATES, EUA_STATES } from "../../../utils";

export function resetDeliveryForm(): DeliveryPriceForm {
  // Evita manter referência no estado.
  return { ...DELIVERY_PRICE_FORM_INITIAL };
}

export function toUfBrasil(val: string): string {
  if (!val) return val;
  const found = BRASIL_STATES.find(
    (s) => s.uf === val || s.nome.toLowerCase() === val.toLowerCase(),
  );
  return found ? found.uf : val;
}

export function toUfEua(val: string): string {
  if (!val) return val;
  const found = EUA_STATES.find(
    (s) => s.uf === val || s.nome.toLowerCase() === val.toLowerCase(),
  );
  return found ? found.uf : val;
}

export function parseMoneyInputToNumber(val: string): number {
  // Suporta vírgula decimal.
  return parseFloat(String(val).replace(",", ".")) || 0;
}

export function parseIntInputToNumber(val: string): number {
  return parseInt(String(val), 10) || 0;
}

