import { useState } from 'react';
import type { Rota, Transacao } from '../../../api';

const transacoesIniciais: Transacao[] = [
  {
    id: '1',
    clienteId: '1',
    clienteNome: 'João Silva',
    tipo: 'receita',
    categoria: 'Serviço de Mudança',
    valor: 850,
    data: '2024-12-15',
    descricao: '2 caixas grandes + fitas',
    metodoPagamento: 'Cartão de Crédito',
  },
  {
    id: '2',
    clienteId: '2',
    clienteNome: 'Carlos Mendes',
    tipo: 'receita',
    categoria: 'Serviço de Mudança',
    valor: 1200,
    data: '2024-12-18',
    descricao: '3 caixas grandes + móveis',
    metodoPagamento: 'Transferência',
  },
];

export type FinanceDataContext = {
  transacoes: Transacao[];
  setTransacoes: (transacoes: Transacao[]) => void;
  addTransacao: (transacao: Transacao) => void;
  deleteTransacao: (id: string) => void;
  rotas: Rota[];
  setRotas: (rotas: Rota[]) => void;
};

export function useFinanceDataContext(): FinanceDataContext {
  const [transacoes, setTransacoes] = useState<Transacao[]>(transacoesIniciais);
  const [rotas, setRotas] = useState<Rota[]>([]);

  const addTransacao = (transacao: Transacao) => {
    setTransacoes((prev) => [...prev, transacao]);
  };

  const deleteTransacao = (id: string) => {
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
  };

  return { transacoes, setTransacoes, addTransacao, deleteTransacao, rotas, setRotas };
}
