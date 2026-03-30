import { useState } from 'react';
import type { FinancialTransaction, Route } from '../../../api';

const transacoesIniciais: FinancialTransaction[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'João Silva',
    type: 'REVENUE',
    category: 'Serviço de Mudança',
    value: 850,
    date: '2024-12-15',
    description: '2 caixas grandes + fitas',
    paymentMethod: 'Cartão de Crédito',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Carlos Mendes',
    type: 'REVENUE',
    category: 'Serviço de Mudança',
    value: 1200,
    date: '2024-12-18',
    description: '3 caixas grandes + móveis',
    paymentMethod: 'Transferência',
  },
];

export type FinanceDataContext = {
  transacoes: FinancialTransaction[];
  setTransacoes: (transacoes: FinancialTransaction[]) => void;
  addTransacao: (transacao: FinancialTransaction) => void;
  deleteTransacao: (id: string) => void;
  rotas: Route[];
  setRotas: (rotas: Route[]) => void;
};

export function useFinanceDataContext(): FinanceDataContext {
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>(transacoesIniciais);
  const [rotas, setRotas] = useState<Route[]>([]);

  const addTransacao = (transacao: FinancialTransaction) => {
    setTransacoes((prev) => [...prev, transacao]);
  };

  const deleteTransacao = (id: string) => {
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
  };

  return { transacoes, setTransacoes, addTransacao, deleteTransacao, rotas, setRotas };
}
