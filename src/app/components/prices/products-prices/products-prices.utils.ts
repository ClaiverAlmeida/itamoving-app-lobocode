import type { ProductPriceForm, ProductPriceType } from "./products-prices.types";
import { PRODUCTS_PRICE_FORM_INITIAL } from "./products-prices.constants";

/** Rótulos PT-BR para tipos de produto do catálogo (chave = valor salvo na API). */
export const PRODUCT_TYPE_LABELS_PT: Record<ProductPriceType, string> = {
  SMALL_BOX: "Caixa Pequena",
  MEDIUM_BOX: "Caixa Média",
  LARGE_BOX: "Caixa Grande",
  PERSONALIZED_ITEM: "Item Personalizado",
  TAPE_ADHESIVE: "Fita Adesiva",
};

export function resetProductForm(): ProductPriceForm {
  // Retorna um novo objeto para evitar estado compartilhado por referência.
  return { ...PRODUCTS_PRICE_FORM_INITIAL };
}

export function getProductTypeLabel(type: ProductPriceType): string {
  return PRODUCT_TYPE_LABELS_PT[type] ?? String(type);
}

/** Qualquer string vinda da API; devolve rótulo amigável se for tipo conhecido. */
export function resolveProductTypeLabel(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (!t) return "—";
  if (t in PRODUCT_TYPE_LABELS_PT) {
    return PRODUCT_TYPE_LABELS_PT[t as ProductPriceType];
  }
  return t;
}

