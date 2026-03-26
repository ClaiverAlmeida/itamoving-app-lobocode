import { useState } from 'react';
import type { Cliente } from '../../../api';

export type ClientsDataContext = {
  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
};

export function useClientsDataContext(): ClientsDataContext {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const addCliente = (cliente: Cliente) => {
    setClientes((prev) => [...prev, cliente]);
  };

  const updateCliente = (id: string, clienteUpdate: Partial<Cliente>) => {
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...clienteUpdate } : c)));
  };

  const deleteCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  return { clientes, setClientes, addCliente, updateCliente, deleteCliente };
}
