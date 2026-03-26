import { useState } from 'react';
import type { PrecoEntrega, PrecoProduto } from '../../../api';

export type PricesDataContext = {
  precosEntrega: PrecoEntrega[];
  setPrecosEntrega: (precos: PrecoEntrega[]) => void;
  addPrecoEntrega: (preco: PrecoEntrega) => void;
  updatePrecoEntrega: (id: string, preco: Partial<PrecoEntrega>) => void;
  deletePrecoEntrega: (id: string) => void;
  precosProdutos: PrecoProduto[];
  setPrecosProdutos: (produtos: PrecoProduto[]) => void;
  addPrecoProduto: (produto: PrecoProduto) => void;
  updatePrecoProduto: (id: string, produto: Partial<PrecoProduto>) => void;
  deletePrecoProduto: (id: string) => void;
};

export function usePricesDataContext(): PricesDataContext {
  const [precosEntrega, setPrecosEntrega] = useState<PrecoEntrega[]>([]);
  const [precosProdutos, setPrecosProdutos] = useState<PrecoProduto[]>([]);

  const addPrecoEntrega = (preco: PrecoEntrega) => {
    setPrecosEntrega((prev) => [...prev, preco]);
  };

  const updatePrecoEntrega = (id: string, precoUpdate: Partial<PrecoEntrega>) => {
    setPrecosEntrega((prev) => prev.map((p) => (p.id === id ? { ...p, ...precoUpdate } : p)));
  };

  const deletePrecoEntrega = (id: string) => {
    setPrecosEntrega((prev) => prev.filter((p) => p.id !== id));
  };

  const addPrecoProduto = (produto: PrecoProduto) => {
    setPrecosProdutos((prev) => [...prev, produto]);
  };

  const updatePrecoProduto = (id: string, produtoUpdate: Partial<PrecoProduto>) => {
    setPrecosProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ...produtoUpdate } : p)));
  };

  const deletePrecoProduto = (id: string) => {
    setPrecosProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    precosEntrega,
    setPrecosEntrega,
    addPrecoEntrega,
    updatePrecoEntrega,
    deletePrecoEntrega,
    precosProdutos,
    setPrecosProdutos,
    addPrecoProduto,
    updatePrecoProduto,
    deletePrecoProduto,
  };
}
