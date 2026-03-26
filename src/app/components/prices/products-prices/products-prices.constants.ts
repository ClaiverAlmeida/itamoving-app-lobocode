import type { ProductPriceForm } from "./products-prices.types";

export const PRODUCTS_PRICE_FORM_INITIAL: ProductPriceForm = {
  type: "SMALL_BOX",
  name: "",
  dimensions: "",
  maxWeight: "",
  costPrice: "",
  salePrice: "",
  active: true,
  variablePrice: false,
};

