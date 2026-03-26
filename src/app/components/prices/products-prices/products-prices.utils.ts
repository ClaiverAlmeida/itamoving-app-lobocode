import type { ProductPriceForm, ProductPriceType } from "./products-prices.types";
import { PRODUCTS_PRICE_FORM_INITIAL } from "./products-prices.constants";

export function resetProductForm(): ProductPriceForm {
  // Retorna um novo objeto para evitar estado compartilhado por referência.
  return { ...PRODUCTS_PRICE_FORM_INITIAL };
}

export function getProductTypeLabel(type: ProductPriceType): string {
  switch (type) {
    case "SMALL_BOX":
      return "Caixa Pequena";
    case "MEDIUM_BOX":
      return "Caixa Média";
    case "LARGE_BOX":
      return "Caixa Grande";
    case "PERSONALIZED_ITEM":
      return "Item Personalizado";
    case "TAPE_ADHESIVE":
      return "Fita Adesiva";
    default:
      return type;
  }
}

