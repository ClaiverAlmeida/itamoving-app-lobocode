import { useState } from 'react';
import type { FinancialTransaction, Route } from '../../../api';

export type FinanceDataContext = {
  transacoes: FinancialTransaction[];
  setTransacoes: (transacoes: FinancialTransaction[]) => void;
  addTransacao: (transacao: FinancialTransaction) => void;
  deleteTransacao: (id: string) => void;
  rotas: Route[];
  setRotas: (rotas: Route[]) => void;
};

export function useFinanceDataContext(): FinanceDataContext {
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>([]);
  const [rotas, setRotas] = useState<Route[]>([]);

  const addTransacao = (transacao: FinancialTransaction) => {
    setTransacoes((prev) => [...prev, transacao]);
  };

  const deleteTransacao = (id: string) => {
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
  };

  return { transacoes, setTransacoes, addTransacao, deleteTransacao, rotas, setRotas };
}
