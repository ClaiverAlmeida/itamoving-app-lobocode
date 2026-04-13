import { Package } from "lucide-react";
import { AdhesiveTapeIcon } from "../ui/adhesive-tape-icon";
import type { ItemKeyEn, ProductType, StockItemConfig } from "./stock.types";

export const ITEM_LABELS: Record<ItemKeyEn, string> = {
  smallBoxes: "Caixas Pequenas",
  mediumBoxes: "Caixas Médias",
  largeBoxes: "Caixas Grandes",
  personalizedItems: "Itens Personalizados",
  adhesiveTape: "Fitas Adesivas",
};

export const PRODUCT_TYPE_TO_ITEM_KEY: Record<ProductType, ItemKeyEn> = {
  SMALL_BOX: "smallBoxes",
  MEDIUM_BOX: "mediumBoxes",
  LARGE_BOX: "largeBoxes",
  PERSONALIZED_ITEM: "personalizedItems",
  TAPE_ADHESIVE: "adhesiveTape",
};

export const ITEM_KEY_TO_PRODUCT_TYPE: Record<ItemKeyEn, ProductType> = {
  smallBoxes: "SMALL_BOX",
  mediumBoxes: "MEDIUM_BOX",
  largeBoxes: "LARGE_BOX",
  personalizedItems: "PERSONALIZED_ITEM",
  adhesiveTape: "TAPE_ADHESIVE",
};

/** Classes `text-*` para ícone de caixa (mesmas cores dos cards de estoque). */
const BOX_PRODUCT_TYPE_ICON_CLASS = {
  SMALL_BOX: "text-red-600",
  MEDIUM_BOX: "text-green-600",
  LARGE_BOX: "text-orange-600",
} as const satisfies Record<Extract<ProductType, `${string}_BOX`>, string>;

/** Ícone de caixa na UI de preços / entrega: pequena vermelha, média verde, grande laranja. */
export function iconClassForBoxProductType(type: ProductType | string | undefined): string {
  if (type === "SMALL_BOX" || type === "MEDIUM_BOX" || type === "LARGE_BOX") {
    return BOX_PRODUCT_TYPE_ICON_CLASS[type];
  }
  return "text-slate-600";
}

export const ESTOQUE_MINIMO: Record<ItemKeyEn, number> = {
  smallBoxes: 50,
  mediumBoxes: 50,
  largeBoxes: 50,
  personalizedItems: 20,
  adhesiveTape: 20,
};

export const ESTOQUE_IDEAL: Record<ItemKeyEn, number> = {
  smallBoxes: 100,
  mediumBoxes: 100,
  largeBoxes: 100,
  personalizedItems: 100,
  adhesiveTape: 100,
};

export const STOCK_ITEMS: StockItemConfig[] = [
  { key: "smallBoxes", nome: "Caixas Pequenas", cor: "red", minimo: ESTOQUE_MINIMO.smallBoxes, ideal: ESTOQUE_IDEAL.smallBoxes },
  { key: "mediumBoxes", nome: "Caixas Médias", cor: "green", minimo: ESTOQUE_MINIMO.mediumBoxes, ideal: ESTOQUE_IDEAL.mediumBoxes },
  { key: "largeBoxes", nome: "Caixas Grandes", cor: "orange", minimo: ESTOQUE_MINIMO.largeBoxes, ideal: ESTOQUE_IDEAL.largeBoxes },
  { key: "personalizedItems", nome: "Itens Personalizados", cor: "purple", minimo: ESTOQUE_MINIMO.personalizedItems, ideal: ESTOQUE_IDEAL.personalizedItems },
  {
    key: "adhesiveTape",
    nome: "Fitas Adesivas",
    cor: "blue",
    minimo: ESTOQUE_MINIMO.adhesiveTape,
    ideal: ESTOQUE_IDEAL.adhesiveTape,
    iconClassName: "text-blue-600",
  },
];

export const STOCK_ICON_BY_KEY = {
  smallBoxes: Package,
  mediumBoxes: Package,
  largeBoxes: Package,
  personalizedItems: Package,
  adhesiveTape: AdhesiveTapeIcon,
} as const;

export const MOVIMENTACOES_PAGE_SIZE = 10;

