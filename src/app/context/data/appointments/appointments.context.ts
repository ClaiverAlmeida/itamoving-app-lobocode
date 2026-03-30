import { useState } from 'react';
import type { Appointment } from '../../../api';

export type AppointmentsDataContext = {
  agendamentos: Appointment[];
  setAgendamentos: (agendamentos: Appointment[]) => void;
  addAgendamento: (agendamento: Appointment) => void;
  updateAgendamento: (id: string, agendamento: Partial<Appointment>) => void;
  deleteAgendamento: (id: string) => void;
};

export function useAppointmentsDataContext(): AppointmentsDataContext {
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([]);

  const addAgendamento = (agendamento: Appointment) => {
    setAgendamentos((prev) => [...prev, agendamento]);
  };

  const updateAgendamento = (id: string, agendamentoUpdate: Partial<Appointment>) => {
    setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, ...agendamentoUpdate } : a)));
  };

  const deleteAgendamento = (id: string) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  };

  return { agendamentos, setAgendamentos, addAgendamento, updateAgendamento, deleteAgendamento };
}
