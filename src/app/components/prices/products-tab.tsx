import React from "react";
import { useData } from "../../context/DataContext";
import { ProductsPricesTab } from "./products-prices";

/** Compat: use `ProductsPricesTab` com props vindas do `DataContext`. */
export function ProdutosTab() {
  const { setPrecosProdutos, deleteProductPrice } = useData();
  return (
    <ProductsPricesTab
      setPrecosProdutos={setPrecosProdutos}
      deleteProductPrice={deleteProductPrice}
    />
  );
}
