import type { PrecoProduto } from "../../../api";

export type ProductPriceType = PrecoProduto["type"];

export type ProductsPricesTabProps = {
  setPrecosProdutos: (precos: PrecoProduto[]) => void;
  deletePrecoProduto: (id: string) => void;
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

