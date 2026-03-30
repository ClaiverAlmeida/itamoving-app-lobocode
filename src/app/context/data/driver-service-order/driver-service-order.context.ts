import { useState } from 'react';
import type { DriverServiceOrder } from '../../../api';

export type DriverServiceOrderDataContext = {
  ordensServicoMotorista: DriverServiceOrder[];
  setOrdensServicoMotorista: (ordens: DriverServiceOrder[]) => void;
  addDriverServiceOrder: (ordem: DriverServiceOrder) => void;
  updateDriverServiceOrder: (id: string, ordem: Partial<DriverServiceOrder>) => void;
  deleteDriverServiceOrder: (id: string) => void;
};

export function useDriverServiceOrderDataContext(): DriverServiceOrderDataContext {
  const [ordensServicoMotorista, setOrdensServicoMotorista] = useState<DriverServiceOrder[]>([]);

  const addDriverServiceOrder = (ordem: DriverServiceOrder) => {
    setOrdensServicoMotorista((prev) => [...prev, ordem]);
  };

  const updateDriverServiceOrder = (id: string, ordemUpdate: Partial<DriverServiceOrder>) => {
    setOrdensServicoMotorista((prev) => prev.map((o) => (o.id === id ? { ...o, ...ordemUpdate } : o)));
  };

  const deleteDriverServiceOrder = (id: string) => {
    setOrdensServicoMotorista((prev) => prev.filter((o) => o.id !== id));
  };

  return {
    ordensServicoMotorista,
    setOrdensServicoMotorista,
    addDriverServiceOrder,
    updateDriverServiceOrder,
    deleteDriverServiceOrder,
  };
}
