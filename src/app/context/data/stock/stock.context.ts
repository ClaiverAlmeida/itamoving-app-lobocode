import { useState } from 'react';
import type { Estoque } from '../../../api';

export type StockDataContext = {
  estoque: Estoque;
  updateEstoque: (estoque: Partial<Estoque>) => void;
};

export function useStockDataContext(): StockDataContext {
  const [estoque, setEstoque] = useState<Estoque>({
    smallBoxes: 0,
    mediumBoxes: 0,
    largeBoxes: 0,
    personalizedItems: 0,
    adhesiveTape: 0,
  });

  const updateEstoque = (estoqueUpdate: Partial<Estoque>) => {
    setEstoque((prev) => ({ ...prev, ...estoqueUpdate }));
  };

  return { estoque, updateEstoque };
}
