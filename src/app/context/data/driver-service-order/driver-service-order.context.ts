import { useState } from 'react';
import type { OrdemServicoMotorista } from '../../../api';

export type DriverServiceOrderDataContext = {
  ordensServicoMotorista: OrdemServicoMotorista[];
  setOrdensServicoMotorista: (ordens: OrdemServicoMotorista[]) => void;
  addOrdemServicoMotorista: (ordem: OrdemServicoMotorista) => void;
  updateOrdemServicoMotorista: (id: string, ordem: Partial<OrdemServicoMotorista>) => void;
  deleteOrdemServicoMotorista: (id: string) => void;
};

export function useDriverServiceOrderDataContext(): DriverServiceOrderDataContext {
  const [ordensServicoMotorista, setOrdensServicoMotorista] = useState<OrdemServicoMotorista[]>([]);

  const addOrdemServicoMotorista = (ordem: OrdemServicoMotorista) => {
    setOrdensServicoMotorista((prev) => [...prev, ordem]);
  };

  const updateOrdemServicoMotorista = (id: string, ordemUpdate: Partial<OrdemServicoMotorista>) => {
    setOrdensServicoMotorista((prev) => prev.map((o) => (o.id === id ? { ...o, ...ordemUpdate } : o)));
  };

  const deleteOrdemServicoMotorista = (id: string) => {
    setOrdensServicoMotorista((prev) => prev.filter((o) => o.id !== id));
  };

  return {
    ordensServicoMotorista,
    setOrdensServicoMotorista,
    addOrdemServicoMotorista,
    updateOrdemServicoMotorista,
    deleteOrdemServicoMotorista,
  };
}
