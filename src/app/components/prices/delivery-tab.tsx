import React from "react";
import { useData } from "../../context/DataContext";
import { DeliveryPricesTab } from "./delivery-prices";

/** Compat: use `DeliveryPricesTab` com props vindas do `DataContext`. */
export function PrecosEntregaTab() {
  const { setPrecosEntrega, deletePrecoEntrega } = useData();
  return (
    <DeliveryPricesTab
      setPrecosEntrega={setPrecosEntrega}
      deletePrecoEntrega={deletePrecoEntrega}
    />
  );
}
