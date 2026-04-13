import type { DriverUser, ProductPrice } from "../../api";

export const ITEM_KEYS_EN = [
  "smallBoxes",
  "mediumBoxes",
  "largeBoxes",
  "personalizedItems",
  "adhesiveTape",
] as const;

export type ItemKeyEn = (typeof ITEM_KEYS_EN)[number];

export type ProductType =
  | "SMALL_BOX"
  | "MEDIUM_BOX"
  | "LARGE_BOX"
  | "PERSONALIZED_ITEM"
  | "TAPE_ADHESIVE";

export interface EstoqueMovimentacao {
  id: string;
  type: "ENTRY" | "EXIT";
  productType: ProductType;
  quantity: number;
  user: {
    id: string;
    name: string;
    role: "DRIVER";
  };
  observations?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    type: string;
  };
}

export type MovementDialogType = "ENTRY" | "EXIT";

export type StockFormData = {
  selectedItem: ItemKeyEn | "";
  selectedProduto: string;
  quantidade: number;
  responsavel: string;
  observacao: string;
};

export type StockItemConfig = {
  key: ItemKeyEn;
  nome: string;
  cor: "red" | "green" | "orange" | "purple" | "blue";
  minimo: number;
  ideal: number;
  /** Opcional: só a cor do ícone (ex.: fita com `AdhesiveTapeIcon` em azul no card). */
  iconClassName?: string;
};

export type StockStatistics = {
  totalItens: number;
  itensCriticos: number;
  itensOk: number;
  entradas7dias: number;
  saidas7dias: number;
};

export type StockDialogData = {
  produtos: ProductPrice[];
  motoristas: DriverUser[];
};

