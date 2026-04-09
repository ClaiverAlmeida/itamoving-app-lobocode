export interface BoxSize {
  id: string;
  name: string;
  maxWeight: number;
  price: number;
}

export interface ShippingItem {
  id: string;
  caixaTamanho: string;
  peso: number;
  descricao: string;
  itensAdicionais: string[];
}

export interface EstoqueMovimentacao {
  id: string;
  type: 'ENTRY' | 'EXIT';
  productType: 'SMALL_BOX' | 'MEDIUM_BOX' | 'LARGE_BOX' | 'PERSONALIZED_ITEM' | 'TAPE_ADHESIVE';
  quantity: number;
  observations?: string;
  createdAt: string;
  productId: string;
  product: {
    id: string;
    name: string;
    type: string;
  };
  user: {
    id: string;
    name: string;
    role: 'DRIVER';
  };
}

export interface Estoque {
  id?: string;
  smallBoxes?: number;
  mediumBoxes?: number;
  largeBoxes?: number;
  personalizedItems?: number;
  adhesiveTape?: number;
  stockMovements?: EstoqueMovimentacao[];
}

export interface EstoqueAtualizado {
  smallBoxes?: number;
  mediumBoxes?: number;
  largeBoxes?: number;
  personalizedItems?: number;
  adhesiveTape?: number;
}

export interface CriarMovimentacao {
  type: 'ENTRY' | 'EXIT';
  productType: 'SMALL_BOX' | 'MEDIUM_BOX' | 'LARGE_BOX' | 'PERSONALIZED_ITEM' | 'TAPE_ADHESIVE';
  quantity: number;
  userId: string;
  observations?: string;
  productId: string;
}

export interface EstoqueBackend {
  id: string;
  companyId: string;
  smallBoxes: number;
  mediumBoxes: number;
  largeBoxes: number;
  adhesiveTape: number;
  personalizedItems: number;
  createdAt: string;
  stockMovements: EstoqueMovimentacao[];
}
