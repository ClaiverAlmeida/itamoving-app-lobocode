import type {
  Agendamento,
  CreateAppointmentsDTO,
  CreateAppointmentsPeriodsDTO,
  UpdateAppointmentsDTO,
  UpdateAppointmentsPeriodsDTO,
} from '../../api';
import { toast } from 'sonner';
import { isCollectionDateInPeriod } from './appointments.utils';

type AppointmentFormData = {
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

type PeriodFormData = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: string;
  observations: string;
};

export async function handleCreateAppointment(args: {
  e: React.FormEvent;
  clientes: { id: string }[];
  formData: AppointmentFormData;
  periodos: CreateAppointmentsPeriodsDTO[];
  create: (payload: CreateAppointmentsDTO) => Promise<{ success: boolean; data?: Agendamento; error?: string }>;
  addAgendamento: (ag: Agendamento) => void;
  resetForm: () => void;
  resetFormPeriod: () => void;
  setIsPeriodic: (value: boolean) => void;
  setIsDialogOpen: (value: boolean) => void;
}) {
  const { e, clientes, formData, periodos, create, addAgendamento, resetForm, resetFormPeriod, setIsPeriodic, setIsDialogOpen } = args;
  e.preventDefault();

  const cliente = clientes.find((c) => c.id === formData.clientId);
  if (!cliente) {
    toast.error('Nenhum cliente selecionado');
    return;
  }

  const periodoSelecionado = periodos.find((p) => p.id === formData.appointmentPeriodId);
  if (formData.isPeriodic && periodos.length === 0) {
    toast.error('Nenhum Período de Coleta encontrado. Crie um período de coleta para poder usar esta opção no agendamento.');
    return;
  }
  if (formData.isPeriodic && !periodoSelecionado) {
    toast.error('Nenhum Período de Coleta selecionado.');
    return;
  }
  if (!formData.status?.trim()) {
    toast.error('Selecione o status do agendamento.');
    return;
  }

  const qty = Math.max(1, Math.floor(Number(formData.qtyBoxes)) || 1);
  if (qty < 1) {
    toast.error('Quantidade de caixas deve ser pelo menos 1.');
    return;
  }

  if (formData.isPeriodic && periodoSelecionado && formData.collectionDate?.trim()) {
    if (!isCollectionDateInPeriod(formData.collectionDate, periodoSelecionado)) {
      toast.error('A data de coleta deve estar dentro do intervalo do período selecionado.');
      return;
    }
  }

  const isPeriodic = Boolean(formData?.isPeriodic);
  const collectionDate = formData.collectionDate?.trim();
  const comPeriodo = isPeriodic && Boolean(formData.appointmentPeriodId?.trim());
  const payload: CreateAppointmentsDTO = {
    clientId: formData.clientId,
    userId: formData.userId,
    collectionDate: collectionDate ? collectionDate : undefined,
    collectionTime: formData.collectionTime?.trim() ?? '',
    value: formData?.value ?? 0,
    downPayment: formData?.downPayment ?? 0,
    isPeriodic,
    qtyBoxes: qty,
    status: formData.status as Agendamento['status'],
    ...(formData.observations?.trim() ? { observations: formData.observations.trim() } : {}),
    ...(comPeriodo ? { appointmentPeriodId: formData.appointmentPeriodId!.trim() } : {}),
  };

  const result = await create(payload);
  if (!result.success || !result.data) {
    toast.error(result.error ?? 'Erro ao criar agendamento.');
    return;
  }

  addAgendamento(result.data);
  resetForm();
  resetFormPeriod();
  setIsPeriodic(false);
  setIsDialogOpen(false);
  toast.success('Agendamento criado com sucesso!');
}

export async function handleCreatePeriod(args: {
  e: React.FormEvent;
  formDataPeriod: PeriodFormData;
  createPeriod: (payload: CreateAppointmentsPeriodsDTO) => Promise<{ success: boolean; data?: CreateAppointmentsPeriodsDTO; error?: string }>;
  resetFormPeriod: () => void;
  setIsCreatePeriodicOpen: (value: boolean) => void;
  carregarPeriodosOpcoes: () => Promise<void>;
  carregarPeriodosLista: (page: number) => Promise<void>;
}) {
  const { e, formDataPeriod, createPeriod, resetFormPeriod, setIsCreatePeriodicOpen, carregarPeriodosOpcoes, carregarPeriodosLista } = args;
  e.preventDefault();
  const emptyStr = (v: string | undefined | null) => (v == null || String(v).trim() === '' ? '' : String(v).trim());
  const payload: CreateAppointmentsPeriodsDTO = {
    title: formDataPeriod.title,
    startDate: emptyStr(formDataPeriod.startDate),
    endDate: emptyStr(formDataPeriod.endDate),
    collectionArea: formDataPeriod.collectionArea,
    status: formDataPeriod.status as Agendamento['status'],
    observations: formDataPeriod.observations ?? '',
  };
  if (formDataPeriod.startDate > formDataPeriod.endDate) {
    toast.error('A data de início não pode ser maior que a data de término.');
    return;
  }

  const result = await createPeriod(payload);
  if (!result.success || !result.data) {
    toast.error(result.error ?? 'Erro ao criar período de coleta.');
    return;
  }

  toast.success('Período de coleta criado com sucesso!');
  resetFormPeriod();
  setIsCreatePeriodicOpen(false);
  await carregarPeriodosOpcoes();
  await carregarPeriodosLista(1);
}

export async function handleAppointmentStatusChange(args: {
  id: string;
  status: Agendamento['status'];
  update: (id: string, payload: UpdateAppointmentsDTO) => Promise<{ success: boolean; data?: Agendamento; error?: string }>;
  updateAgendamento: (id: string, ag: Agendamento) => void;
  setSelectedAgendamento: (ag: Agendamento | null) => void;
  carregarAgendamentos: () => Promise<void>;
}) {
  const { id, status, update, updateAgendamento, setSelectedAgendamento, carregarAgendamentos } = args;
  const result = await update(id, { status });
  if (!result.success || !result.data) {
    toast.error(result.error ?? 'Erro ao atualizar status do agendamento.');
    return;
  }
  updateAgendamento(id, result.data);
  setSelectedAgendamento(null);
  await carregarAgendamentos();
  toast.success('Status atualizado!');
  return result.data;
}

export async function handleAppointmentDelete(args: {
  id: string;
  clientName: string;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAgendamento: (id: string) => void;
  setSelectedAgendamento: (ag: Agendamento | null) => void;
  carregarAgendamentos: () => Promise<void>;
}) {
  const { id, clientName, remove, deleteAgendamento, setSelectedAgendamento, carregarAgendamentos } = args;
  const confirm = window.confirm(`Tem certeza que deseja excluir o agendamento de ${clientName}?`);
  if (!confirm) return null;
  const result = await remove(id);
  if (!result.success) {
    toast.error(result.error ?? 'Erro ao excluir agendamento.');
    return null;
  }
  deleteAgendamento(id);
  setSelectedAgendamento(null);
  await carregarAgendamentos();
  toast.success('Agendamento excluído com sucesso!');
  return true;
}

export async function handleEditAppointment(args: {
  e: React.FormEvent;
  agendamento: Agendamento;
  clientes: { id: string }[];
  formData: AppointmentFormData;
  periodos: CreateAppointmentsPeriodsDTO[];
  selectedAgendamento: Agendamento | null;
  update: (id: string, payload: UpdateAppointmentsDTO) => Promise<{ success: boolean; data?: Agendamento; error?: string }>;
  updateAgendamento: (id: string, ag: Agendamento) => void;
  setSelectedAgendamento: (ag: Agendamento | null) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  resetEditForm: () => void;
  resetForm: () => void;
  resetFormPeriod: () => void;
  setIsPeriodic: (value: boolean) => void;
  carregarAgendamentos: () => Promise<void>;
}) {
  const {
    e,
    agendamento,
    clientes,
    formData,
    periodos,
    selectedAgendamento,
    update,
    updateAgendamento,
    setSelectedAgendamento,
    setIsEditDialogOpen,
    resetEditForm,
    resetForm,
    resetFormPeriod,
    setIsPeriodic,
    carregarAgendamentos,
  } = args;
  e.preventDefault();

  if (!agendamento) {
    toast.error('Agendamento não encontrado');
    return;
  }
  const cliente = clientes.find((c) => c.id === formData.clientId);
  if (!cliente) {
    toast.error('Cliente não encontrado');
    return;
  }
  const periodoSelecionado = periodos.find((p) => p.id === formData.appointmentPeriodId);
  if (formData.isPeriodic && periodos.length === 0) {
    toast.error('Nenhum Período de Coleta encontrado. Crie um período de coleta para poder usar esta opção no agendamento.');
    return;
  }
  if (formData.isPeriodic && !periodoSelecionado) {
    toast.error('Nenhum Período de Coleta selecionado.');
    return;
  }
  if (!formData.status?.trim()) {
    toast.error('Selecione o status do agendamento.');
    return;
  }

  const qty = Number(formData.qtyBoxes);
  if (!Number.isInteger(qty) || qty < 1) {
    toast.error('Quantidade de caixas deve ser pelo menos 1.');
    return;
  }

  const getUpdatePayload = (): UpdateAppointmentsDTO => {
    const emptyStr = (v: string | undefined | null) => (v == null || String(v).trim() === '' ? '' : String(v).trim());
    const dateOnly = (v: string | undefined | null) => (emptyStr(v) ? String(v).trim().slice(0, 10) : '');
    const timeOnly = (v: string | undefined | null) => {
      const s = emptyStr(v);
      return /^\d{1,2}:\d{2}/.test(s) ? s.slice(0, 5) : s;
    };
    const current = {
      clientId: formData.clientId,
      userId: formData.userId,
      collectionDate: emptyStr(formData.collectionDate),
      collectionTime: emptyStr(formData.collectionTime),
      value: formData?.value ?? 0,
      downPayment: formData?.downPayment ?? 0,
      isPeriodic: Boolean(formData?.isPeriodic),
      qtyBoxes: qty,
      status: formData.status as Agendamento['status'],
      observations: emptyStr(formData.observations),
      appointmentPeriodId: formData.isPeriodic && formData.appointmentPeriodId?.trim() ? formData.appointmentPeriodId.trim() : '',
    };
    const original = selectedAgendamento!;
    const origObs = original.observations ?? '';
    const origCollectionTime = timeOnly(original.collectionTime);
    const origCollectionDate = dateOnly(original.collectionDate);
    const patch: UpdateAppointmentsDTO = {};
    if (current.clientId !== original.client?.id) patch.clientId = current.clientId;
    if (current.userId !== original.user?.id) patch.userId = current.userId;
    if (dateOnly(current.collectionDate) !== origCollectionDate) {
      const t = emptyStr(formData.collectionDate);
      (patch as Record<string, unknown>).collectionDate = t ? t.slice(0, 10) : null;
    }
    if (timeOnly(current.collectionTime) !== origCollectionTime) patch.collectionTime = current.collectionTime;
    if (current.value !== original.value) patch.value = current.value;
    if (current.downPayment !== original.downPayment) patch.downPayment = current.downPayment;
    if (current.isPeriodic !== Boolean(original.isPeriodic)) patch.isPeriodic = current.isPeriodic;
    if (current.qtyBoxes !== original.qtyBoxes) patch.qtyBoxes = current.qtyBoxes;
    if (current.status !== original.status) patch.status = current.status;
    if (current.observations !== origObs) patch.observations = current.observations;
    const currPeriod = current.appointmentPeriodId ?? '';
    const origPeriod = original.appointmentPeriodId ?? '';
    if (currPeriod !== origPeriod) patch.appointmentPeriodId = currPeriod || '';
    return patch;
  };

  const patchPayload = getUpdatePayload();
  if (Object.keys(patchPayload).length === 0) {
    toast.info('Nenhum campo alterado.');
    return;
  }

  if (formData.isPeriodic && periodoSelecionado && formData.collectionDate?.trim()) {
    if (!isCollectionDateInPeriod(formData.collectionDate, periodoSelecionado)) {
      toast.error('A data de coleta deve estar dentro do intervalo do período selecionado.');
      return;
    }
  }

  const result = await update(selectedAgendamento!.id!, patchPayload);
  if (!result.success || !result.data) {
    toast.error(result.error ?? 'Erro ao atualizar agendamento.');
    return;
  }

  updateAgendamento(selectedAgendamento!.id!, result.data);
  setSelectedAgendamento(result.data);
  setIsEditDialogOpen(false);
  resetEditForm();
  resetForm();
  resetFormPeriod();
  setIsPeriodic(false);
  await carregarAgendamentos();
  toast.success('Agendamento atualizado com sucesso!');
}

export async function handleEditCollectionPeriod(args: {
  e?: React.FormEvent;
  confirmed?: boolean;
  selectedPeriod: CreateAppointmentsPeriodsDTO | null;
  formDataPeriod: PeriodFormData;
  pendingEditPeriodPayloadRef: { current: UpdateAppointmentsPeriodsDTO | null };
  setConfirmEditPeriodOpen: (open: boolean) => void;
  updatePeriod: (id: string, payload: UpdateAppointmentsPeriodsDTO) => Promise<{ success: boolean; data?: UpdateAppointmentsPeriodsDTO; error?: string }>;
  setIsDialogEditPeriodOpen: (open: boolean) => void;
  resetFormPeriod: () => void;
  carregarPeriodosOpcoes: () => Promise<void>;
  carregarPeriodosLista: (page: number) => Promise<void>;
  periodosListCurrentPage: number;
  carregarAgendamentos: () => Promise<void>;
  setSelectedPeriod: (period: CreateAppointmentsPeriodsDTO | null) => void;
}) {
  const {
    e,
    confirmed,
    selectedPeriod,
    formDataPeriod,
    pendingEditPeriodPayloadRef,
    setConfirmEditPeriodOpen,
    updatePeriod,
    setIsDialogEditPeriodOpen,
    resetFormPeriod,
    carregarPeriodosOpcoes,
    carregarPeriodosLista,
    periodosListCurrentPage,
    carregarAgendamentos,
    setSelectedPeriod,
  } = args;
  e?.preventDefault();
  if (!selectedPeriod) {
    toast.error('Período não selecionado.');
    return;
  }
  if (formDataPeriod.startDate > formDataPeriod.endDate) {
    toast.error('A data de início não pode ser maior que a data de término.');
    return;
  }

  const emptyStr = (v: string | undefined | null) => (v == null || String(v).trim() === '' ? '' : String(v).trim());
  const dateOnly = (v: string | undefined | null) => (emptyStr(v) ? String(v).trim().slice(0, 10) : '');
  const original = selectedPeriod;
  const origObs = original.observations ?? '';
  const patchPayload: UpdateAppointmentsPeriodsDTO = {};
  const current = {
    title: formDataPeriod.title,
    startDate: dateOnly(formDataPeriod.startDate),
    endDate: dateOnly(formDataPeriod.endDate),
    collectionArea: formDataPeriod.collectionArea,
    status: formDataPeriod.status as Agendamento['status'],
    observations: emptyStr(formDataPeriod.observations),
  };
  if (current.title !== original.title) patchPayload.title = current.title;
  if (current.startDate !== dateOnly(original.startDate)) patchPayload.startDate = current.startDate;
  if (current.endDate !== dateOnly(original.endDate)) patchPayload.endDate = current.endDate;
  if (current.collectionArea !== original.collectionArea) patchPayload.collectionArea = current.collectionArea;
  if (current.status !== original.status) patchPayload.status = current.status;
  if (current.observations !== origObs) patchPayload.observations = current.observations;
  if (Object.keys(patchPayload).length === 0) {
    toast.info('Nenhum campo alterado.');
    return;
  }

  if (!confirmed && (patchPayload.startDate || patchPayload.endDate)) {
    pendingEditPeriodPayloadRef.current = patchPayload;
    setConfirmEditPeriodOpen(true);
    return;
  }

  const payload = pendingEditPeriodPayloadRef.current ?? patchPayload;
  pendingEditPeriodPayloadRef.current = null;
  setConfirmEditPeriodOpen(false);
  const result = await updatePeriod(selectedPeriod.id!, payload);
  if (!result.success || !result.data) {
    toast.error(result.error ?? 'Erro ao atualizar período.');
    return;
  }

  toast.success('Período atualizado com sucesso!');
  setIsDialogEditPeriodOpen(false);
  resetFormPeriod();
  await carregarPeriodosOpcoes();
  await carregarPeriodosLista(periodosListCurrentPage);
  await carregarAgendamentos();
  setSelectedPeriod(result.data as CreateAppointmentsPeriodsDTO);
}
