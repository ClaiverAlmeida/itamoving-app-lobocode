import { useState } from 'react';
import type { Agendamento } from '../../../api';

export type AppointmentsDataContext = {
  agendamentos: Agendamento[];
  setAgendamentos: (agendamentos: Agendamento[]) => void;
  addAgendamento: (agendamento: Agendamento) => void;
  updateAgendamento: (id: string, agendamento: Partial<Agendamento>) => void;
  deleteAgendamento: (id: string) => void;
};

export function useAppointmentsDataContext(): AppointmentsDataContext {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const addAgendamento = (agendamento: Agendamento) => {
    setAgendamentos((prev) => [...prev, agendamento]);
  };

  const updateAgendamento = (id: string, agendamentoUpdate: Partial<Agendamento>) => {
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, ...agendamentoUpdate } : a)));
  };

  const deleteAgendamento = (id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  };

  return { agendamentos, setAgendamentos, addAgendamento, updateAgendamento, deleteAgendamento };
}
