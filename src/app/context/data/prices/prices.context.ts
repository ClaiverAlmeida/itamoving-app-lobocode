import { useState } from 'react';
import type { DeliveryPrice, ProductPrice } from '../../../api';

export type PricesDataContext = {
  precosEntrega: DeliveryPrice[];
  setPrecosEntrega: (precos: DeliveryPrice[]) => void;
  addDeliveryPrice: (preco: DeliveryPrice) => void;
  updateDeliveryPrice: (id: string, preco: Partial<DeliveryPrice>) => void;
  deleteDeliveryPrice: (id: string) => void;
  precosProdutos: ProductPrice[];
  setPrecosProdutos: (produtos: ProductPrice[]) => void;
  addProductPrice: (produto: ProductPrice) => void;
  updateProductPrice: (id: string, produto: Partial<ProductPrice>) => void;
  deleteProductPrice: (id: string) => void;
};

export function usePricesDataContext(): PricesDataContext {
  const [precosEntrega, setPrecosEntrega] = useState<DeliveryPrice[]>([]);
  const [precosProdutos, setPrecosProdutos] = useState<ProductPrice[]>([]);

  const addDeliveryPrice = (preco: DeliveryPrice) => {
    setPrecosEntrega((prev) => [...prev, preco]);
  };

  const updateDeliveryPrice = (id: string, precoUpdate: Partial<DeliveryPrice>) => {
    setPrecosEntrega((prev) => prev.map((p) => (p.id === id ? { ...p, ...precoUpdate } : p)));
  };

  const deleteDeliveryPrice = (id: string) => {
    setPrecosEntrega((prev) => prev.filter((p) => p.id !== id));
  };

  const addProductPrice = (produto: ProductPrice) => {
    setPrecosProdutos((prev) => [...prev, produto]);
  };

  const updateProductPrice = (id: string, produtoUpdate: Partial<ProductPrice>) => {
    setPrecosProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...produtoUpdate } : p)));
  };

  const deleteProductPrice = (id: string) => {
    setPrecosProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    precosEntrega,
    setPrecosEntrega,
    addDeliveryPrice,
    updateDeliveryPrice,
    deleteDeliveryPrice,
    precosProdutos,
    setPrecosProdutos,
    addProductPrice,
    updateProductPrice,
    deleteProductPrice,
  };
}
