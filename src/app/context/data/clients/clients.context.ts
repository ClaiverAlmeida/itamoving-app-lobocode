import { useState } from 'react';
import type { Client } from '../../../api';

export type ClientsDataContext = {
  clientes: Client[];
  setClientes: (clientes: Client[]) => void;
  addCliente: (cliente: Client) => void;
  updateCliente: (id: string, cliente: Partial<Client>) => void;
  deleteCliente: (id: string) => void;
};

export function useClientsDataContext(): ClientsDataContext {
  const [clientes, setClientes] = useState<Client[]>([]);

  const addCliente = (cliente: Client) => {
    setClientes((prev) => [...prev, cliente]);
  };

  const updateCliente = (id: string, clienteUpdate: Partial<Client>) => {
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...clienteUpdate } : c)));
  };

  const deleteCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  return { clientes, setClientes, addCliente, updateCliente, deleteCliente };
}
