import { useState } from 'react';
import { format } from 'date-fns';
import type { Appointment, UpdateAppointmentsPeriodsDTO } from '../../../api';
import { toDateOnly } from '../../../utils';

export type AppointmentFormData = {
  clientId: string;
  collectionDate: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic: boolean;
  qtyBoxes: number;
  observations: string;
  userId: string;
  status: string;
  appointmentPeriodId: string;
};

export type AppointmentPeriodFormData = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: string;
  observations: string;
};

const INITIAL_FORM_DATA: AppointmentFormData = {
  clientId: '',
  collectionDate: '',
  collectionTime: '',
  value: 0,
  downPayment: 0,
  isPeriodic: false,
  qtyBoxes: 0,
  observations: '',
  userId: '',
  status: '',
  appointmentPeriodId: '',
};

const INITIAL_PERIOD_FORM_DATA: AppointmentPeriodFormData = {
  id: '',
  title: '',
  startDate: '',
  endDate: '',
  collectionArea: '',
  status: '',
  observations: '',
};

export function useAppointmentsForms(args: {
  selectedAgendamento: Appointment | null;
  selectedPeriod: UpdateAppointmentsPeriodsDTO | null;
  setQtdCaixasPorDia: React.Dispatch<React.SetStateAction<{ collectionDate: string; qtyBoxes: number }[]>>;
  setQtdCaixasPorPeriodo: React.Dispatch<React.SetStateAction<{ collectionDate: string; qtyBoxes: number }[]>>;
  setSemDiaColetaNoPeriodo: React.Dispatch<React.SetStateAction<number>>;
  carregarQtdCaixasPorDia: (collectionDate: string, isPeriodic: boolean, appointmentPeriodId: string) => Promise<void>;
  carregarPeriodosOpcoes: () => Promise<void>;
}) {
  const {
    selectedAgendamento,
    selectedPeriod,
    setQtdCaixasPorDia,
    setQtdCaixasPorPeriodo,
    setSemDiaColetaNoPeriodo,
    carregarQtdCaixasPorDia,
    carregarPeriodosOpcoes,
  } = args;

  const [filters, setFilters] = useState({
    status: [] as string[],
    userId: '',
    periodo: 'todos' as 'todos' | 'hoje' | 'semana' | 'mes',
  });

  const [formData, setFormData] = useState<AppointmentFormData>(INITIAL_FORM_DATA);
  const [formDataPeriod, setFormDataPeriod] = useState<AppointmentPeriodFormData>(INITIAL_PERIOD_FORM_DATA);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setQtdCaixasPorDia([]);
    setQtdCaixasPorPeriodo([]);
    setSemDiaColetaNoPeriodo(0);
  };

  const resetEditForm = () => {
    setFormData({
      clientId: selectedAgendamento?.client.id ?? '',
      collectionDate: selectedAgendamento?.collectionDate ?? '',
      collectionTime: selectedAgendamento?.collectionTime ?? '',
      value: selectedAgendamento?.value ?? 0,
      downPayment: selectedAgendamento?.downPayment ?? 0,
      isPeriodic: selectedAgendamento?.isPeriodic ?? false,
      qtyBoxes: selectedAgendamento?.qtyBoxes ?? 0,
      observations: selectedAgendamento?.observations ?? '',
      userId: selectedAgendamento?.user.id ?? '',
      status: selectedAgendamento?.status ?? '',
      appointmentPeriodId: selectedAgendamento?.appointmentPeriodId ?? '',
    });
  };

  const resetFormPeriod = () => {
    setFormDataPeriod(INITIAL_PERIOD_FORM_DATA);
  };

  const resetEditFormPeriod = () => {
    setFormDataPeriod({
      id: selectedPeriod?.id ?? '',
      title: selectedPeriod?.title ?? '',
      startDate: selectedPeriod?.startDate ?? '',
      endDate: selectedPeriod?.endDate ?? '',
      collectionArea: selectedPeriod?.collectionArea ?? '',
      status: selectedPeriod?.status ?? '',
      observations: selectedPeriod?.observations ?? '',
    });
  };

  const fillEditFormPeriodFrom = (periodo: UpdateAppointmentsPeriodsDTO) => {
    setFormDataPeriod({
      id: periodo?.id ?? '',
      title: periodo?.title ?? '',
      startDate: toDateOnly(String(periodo?.startDate ?? '')),
      endDate: toDateOnly(String(periodo?.endDate ?? '')),
      collectionArea: periodo?.collectionArea ?? '',
      status: periodo?.status ?? 'PENDING',
      observations: periodo?.observations ?? '',
    });
  };

  const fillEditFormFromSelected = () => {
    if (!selectedAgendamento) return;
    const dateRaw = selectedAgendamento.collectionDate ?? '';
    const collectionDate = /^\d{4}-\d{2}-\d{2}/.test(dateRaw) ? dateRaw.slice(0, 10) : dateRaw;
    const timeRaw = selectedAgendamento.collectionTime ?? '';
    const collectionTime = /^\d{1,2}:\d{2}/.test(timeRaw) ? timeRaw.slice(0, 5) : timeRaw;
    setFormData({
      clientId: selectedAgendamento.client?.id ?? '',
      collectionDate,
      collectionTime,
      value: selectedAgendamento?.value ?? 0,
      downPayment: selectedAgendamento?.downPayment ?? 0,
      isPeriodic: selectedAgendamento?.isPeriodic ?? false,
      qtyBoxes: selectedAgendamento.qtyBoxes ?? 0,
      observations: selectedAgendamento.observations ?? '',
      userId: selectedAgendamento.user?.id ?? '',
      status: selectedAgendamento.status ?? '',
      appointmentPeriodId: selectedAgendamento?.appointmentPeriodId ?? '',
    });
    void carregarQtdCaixasPorDia(
      collectionDate || format(new Date(), 'yyyy-MM-dd'),
      selectedAgendamento?.isPeriodic ?? false,
      selectedAgendamento?.appointmentPeriodId ?? '',
    );
    if (selectedAgendamento?.isPeriodic && selectedAgendamento?.appointmentPeriodId) {
      void carregarPeriodosOpcoes();
    }
  };

  return {
    filters,
    setFilters,
    formData,
    setFormData,
    formDataPeriod,
    setFormDataPeriod,
    resetForm,
    resetEditForm,
    resetFormPeriod,
    resetEditFormPeriod,
    fillEditFormPeriodFrom,
    fillEditFormFromSelected,
  };
}
