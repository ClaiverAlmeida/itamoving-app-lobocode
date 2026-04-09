import type { ProductPrice } from "../../../api";

export type ProductPriceType = ProductPrice["type"];

export type ProductsPricesTabProps = {
  setPrecosProdutos: (precos: ProductPrice[]) => void;
  deleteProductPrice: (id: string) => void;
  className?: string;
};

export type ProductPriceForm = {
  type: ProductPriceType;
  name: string;
  dimensions: string | undefined;
  maxWeight: string | undefined;
  costPrice: string;
  salePrice: string;
  active: boolean;
  variablePrice: boolean;
};

