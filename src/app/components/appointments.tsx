import React from "react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "./ui/utils";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useData } from "../context/DataContext";
import { Agendamento, Cliente } from "../types";
import {
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  User,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Package,
  Truck,
  Phone,
  Navigation,
  TrendingUp,
  BarChart3,
  X,
  MessageCircle,
  Box,
  Edit,
  PanelRightOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  isYesterday,
  isToday,
  isTomorrow,
  isPast,
  isSameDay,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  add,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AtendenteSelect } from "./forms";
import { EmptyStateAlert, AppointmentBoxesPerDayAlert, AppointmentBoxesPerPeriodAlert } from "./alerts";
import { clientsService } from "../services/clients.service";
import { appointmentsService, CreateAppointmentsDTO, CreateAppointmentsPeriodsDTO, UpdateAppointmentsDTO, UpdateAppointmentsPeriodsDTO } from "../services/appointments.service";
import { connectSocket, getSocket } from "../services/socket.service";
import { toDateOnly, formatDateOnlyToBR } from "../utils";

type ViewMode = "calendar" | "list" | "timeline";

/** Converte "YYYY-MM-DD" em Date em horário local (meio-dia) para o calendário não duplicar dias por causa de timezone. */
function parseLocalDate(dateStr: string): Date {
  if (!dateStr || dateStr.length < 10) return new Date(NaN);
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(5, 7), 10) - 1;
  const day = parseInt(dateStr.slice(8, 10), 10);
  return new Date(y, m, day, 12, 0, 0, 0);
}

/** Normaliza uma data para YYYY-MM-DD (para comparação). Aceita YYYY-MM-DD ou ISO string. */
function toYYYYMMDD(value: string | Date): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return null;
  }
  if (!Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return null;
}

/** Retorna true se a data de coleta está dentro do intervalo do período (inclusive). */
function isCollectionDateInPeriod(
  collectionDate: string,
  period: { startDate: string | Date; endDate: string | Date },
): boolean {
  const d = toYYYYMMDD(collectionDate);
  const startStr = toYYYYMMDD(period.startDate);
  const endStr = toYYYYMMDD(period.endDate);
  if (!d || !startStr || !endStr) return false;
  return d >= startStr && d <= endStr;
}

export default function AgendamentosView() {
  const {
    agendamentos,
    setAgendamentos,
    addAgendamento,
    updateAgendamento,
    deleteAgendamento,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogEditPeriodOpen, setIsDialogEditPeriodOpen] = useState(false);
  const [isCreatePeriodicOpen, setIsCreatePeriodicOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isPeriodic, setIsPeriodic] = useState<boolean>(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [qtdCaixasPorDia, setQtdCaixasPorDia] = useState<
    { collectionDate: string; qtyBoxes: number }[]
  >([]);

  const [qtdCaixasPorPeriodo, setQtdCaixasPorPeriodo] = useState<
    { collectionDate: string; qtyBoxes: number }[]
  >([]);

  const clientesAtivos = useMemo(
    () => clientes.filter((c) => c.status === "ACTIVE"),
    [clientes]
  );

  const [periodos, setPeriodos] = useState<CreateAppointmentsPeriodsDTO[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<CreateAppointmentsPeriodsDTO | null>(null);
  /** Dia opcional no período: quando null, mostra todos os dias do período; quando definido, filtra por esse dia. */
  const [selectedDayInPeriod, setSelectedDayInPeriod] = useState<Date | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [confirmEditPeriodOpen, setConfirmEditPeriodOpen] = useState(false);
  const pendingEditPeriodPayloadRef = useRef<UpdateAppointmentsPeriodsDTO | null>(null);

  const carregarAgendamentos = useCallback(async () => {
    const result = await appointmentsService.getAll();
    if (result.success && result.data) {
      setAgendamentos(result.data);
    }
  }, [setAgendamentos]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  useEffect(() => {
    (async () => {
      const result = await appointmentsService.getAllPeriods();
      if (result.success && result.data) setPeriodos(result.data);
    })();
  }, []);

  const carregarPeriodos = (async () => {
    const result = await appointmentsService.getAllPeriods();
    if (result.success && result.data) {
      setPeriodos(result.data);
    }
  });

  // Receber notificações de agendamentos via WebSocket e atualizar a lista
  useEffect(() => {
    const socket = connectSocket() ?? getSocket();
    if (!socket) return;
    const onNotification = (payload: { entityType?: string; title?: string; message?: string }) => {
      if (payload.entityType !== "APPOINTMENT") return;
      toast.success(payload.title ?? "Agendamentos", {
        description: payload.message,
      });
      carregarAgendamentos();
    };
    socket.on("new_notification", onNotification);
    return () => {
      socket.off("new_notification", onNotification);
    };
  }, [carregarAgendamentos]);

  const carregarQtdCaixasPorDia = async (collectionDate: string, isPeriodic: boolean, appointmentPeriodId: string) => {
    if (!collectionDate?.trim()) {
      setQtdCaixasPorDia([]);
      return;
    };

    const collectionDateISO = new Date(collectionDate).toISOString() ?? "";
    const result = await appointmentsService.getAllQtdBoxesPerDay(collectionDateISO, isPeriodic, appointmentPeriodId);
    if (result.success && result.data !== undefined) {
      const raw = result.data as any;
      const list: { collectionDate: string; qtyBoxes: number }[] =
        Array.isArray(raw)
          ? raw
          : raw?.data != null
            ? Array.isArray(raw.data)
              ? raw.data
              : [raw.data]
            : typeof raw === "object" &&
              raw !== null &&
              ("qtyBoxes" in raw || "collectionDate" in raw)
              ? [raw]
              : [];
      setQtdCaixasPorDia(list);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const carregarQtdCaixasPorPeriodo = async (startDate: string, endDate: string) => {
    if (!startDate?.trim() || !endDate?.trim()) {
      setQtdCaixasPorPeriodo([]);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return;
    const startDateISO = toDateOnly(startDate) || start.toISOString().slice(0, 10);
    const endDateISO = toDateOnly(endDate) || end.toISOString().slice(0, 10);

    const result = await appointmentsService.getAllQtdBoxesPerPeriod(startDateISO, endDateISO);
    if (result.success && result.data !== undefined) {
      const raw = result.data as any;
      const list: { collectionDate: string; qtyBoxes: number }[] =
        Array.isArray(raw)
          ? raw
          : raw?.data != null
            ? Array.isArray(raw.data)
              ? raw.data
              : [raw.data]
            : typeof raw === "object" &&
              raw !== null &&
              "collectionDate" in raw
              ? [raw]
              : [];
      setQtdCaixasPorPeriodo(list);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const [filters, setFilters] = useState({
    status: [] as string[],
    userId: "",
    periodo: "todos" as "todos" | "hoje" | "semana" | "mes",
  });

  const [formData, setFormData] = useState({
    clientId: "",
    collectionDate: "",
    collectionTime: "",
    value: 0,
    downPayment: 0,
    isPeriodic: false,
    qtyBoxes: 0,
    observations: "",
    userId: "",
    status: "",
    appointmentPeriodId: "",
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      collectionDate: "",
      collectionTime: "",
      value: 0,
      downPayment: 0,
      isPeriodic: false,
      qtyBoxes: 0,
      observations: "",
      userId: "",
      status: "",
      appointmentPeriodId: "",
    });
    setQtdCaixasPorDia([]);
    setQtdCaixasPorPeriodo([]);
  };

  const resetEditForm = () => {
    setFormData({
      clientId: selectedAgendamento?.client.id ?? "",
      collectionDate: selectedAgendamento?.collectionDate ?? "",
      collectionTime: selectedAgendamento?.collectionTime ?? "",
      value: selectedAgendamento?.value ?? 0,
      downPayment: selectedAgendamento?.downPayment ?? 0,
      isPeriodic: selectedAgendamento?.isPeriodic ?? false,
      qtyBoxes: selectedAgendamento?.qtyBoxes ?? 0,
      observations: selectedAgendamento?.observations ?? "",
      userId: selectedAgendamento?.user.id ?? "",
      status: selectedAgendamento?.status ?? "",
      appointmentPeriodId: selectedAgendamento?.appointmentPeriodId ?? "",
    });
  };

  const [formDataPeriod, setFormDataPeriod] = useState({
    id: "",
    title: "",
    startDate: "",
    endDate: "",
    collectionArea: "",
    status: "",
    observations: "",
  });

  const resetFormPeriod = () => {
    setFormDataPeriod({
      id: "",
      title: "",
      startDate: "",
      endDate: "",
      collectionArea: "",
      status: "",
      observations: "",
    });
  }

  const resetEditFormPeriod = () => {
    setFormDataPeriod({
      id: selectedPeriod?.id ?? "",
      title: selectedPeriod?.title ?? "",
      startDate: selectedPeriod?.startDate ?? "",
      endDate: selectedPeriod?.endDate ?? "",
      collectionArea: selectedPeriod?.collectionArea ?? "",
      status: selectedPeriod?.status ?? "",
      observations: selectedPeriod?.observations ?? "",
    })
  }

  /** Preenche o formulário de edição de período com os dados do período (datas em YYYY-MM-DD para input type="date"). */
  const fillEditFormPeriodFrom = (periodo: UpdateAppointmentsPeriodsDTO) => {
    setFormDataPeriod({
      id: periodo?.id ?? "",
      title: periodo?.title ?? "",
      startDate: toDateOnly(String(periodo?.startDate ?? "")),
      endDate: toDateOnly(String(periodo?.endDate ?? "")),
      collectionArea: periodo?.collectionArea ?? "",
      status: periodo?.status ?? "PENDING",
      observations: periodo?.observations ?? "",
    });
  };

  /** Preenche o formulário de edição com os dados do agendamento selecionado (data/hora no formato dos inputs). */
  const fillEditFormFromSelected = () => {
    if (!selectedAgendamento) return;
    const dateRaw = selectedAgendamento.collectionDate ?? "";
    const collectionDate = /^\d{4}-\d{2}-\d{2}/.test(dateRaw) ? dateRaw.slice(0, 10) : dateRaw;
    const timeRaw = selectedAgendamento.collectionTime ?? "";
    const collectionTime = /^\d{1,2}:\d{2}/.test(timeRaw) ? timeRaw.slice(0, 5) : timeRaw;
    setFormData({
      clientId: selectedAgendamento.client?.id ?? "",
      collectionDate,
      collectionTime,
      value: selectedAgendamento?.value ?? 0,
      downPayment: selectedAgendamento?.downPayment ?? 0,
      isPeriodic: selectedAgendamento?.isPeriodic ?? false,
      qtyBoxes: selectedAgendamento.qtyBoxes ?? 0,
      observations: selectedAgendamento.observations ?? "",
      userId: selectedAgendamento.user?.id ?? "",
      status: selectedAgendamento.status ?? "",
      appointmentPeriodId: selectedAgendamento?.appointmentPeriodId ?? "",
    });
    carregarQtdCaixasPorDia(collectionDate || format(new Date(), "yyyy-MM-dd"), selectedAgendamento?.isPeriodic ?? false, selectedAgendamento?.appointmentPeriodId ?? "");
    if (selectedAgendamento?.isPeriodic && selectedAgendamento?.appointmentPeriodId) {
      carregarPeriodos();
    }
  };

  /** Recarrega caixas por período quando o período é escolhido ou quando a lista de períodos chega/atualiza (ex.: após cadastrar período). */
  const periodDialogOpen = isDialogOpen || isEditDialogOpen;
  useEffect(() => {
    if (!periodDialogOpen || !formData.isPeriodic || !formData.appointmentPeriodId?.trim() || periodos.length === 0) return;
    const pid = String(formData.appointmentPeriodId).trim();
    const period = periodos.find((p) => String(p.id ?? "") === pid);
    if (period?.startDate != null && period?.endDate != null) {
      const startStr = typeof period.startDate === "string" ? period.startDate.slice(0, 10) : new Date(period.startDate).toISOString().slice(0, 10);
      const endStr = typeof period.endDate === "string" ? period.endDate.slice(0, 10) : new Date(period.endDate).toISOString().slice(0, 10);
      carregarQtdCaixasPorPeriodo(startStr, endStr);
    }
  }, [periodDialogOpen, formData.isPeriodic, formData.appointmentPeriodId, periodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cliente = clientes.find((c) => c.id === formData.clientId);
    if (!cliente) {
      toast.error("Nenhum cliente selecionado");
      return;
    }

    const periodoSelecionado = periodos.find((p) => p.id === formData.appointmentPeriodId);

    if (formData.isPeriodic && periodos.length === 0) {
      toast.error("Nenhum Período de Coleta encontrado. Crie um período de coleta para poder usar esta opção no agendamento.");
      return;
    }

    if (formData.isPeriodic && !periodoSelecionado) {
      toast.error("Nenhum Período de Coleta selecionado.");
      return;
    }

    if (!formData.status?.trim()) {
      toast.error("Selecione o status do agendamento.");
      return;
    }

    const qty = Math.max(1, Math.floor(Number(formData.qtyBoxes)) || 1);
    if (qty < 1) {
      toast.error("Quantidade de caixas deve ser pelo menos 1.");
      return;
    }

    if (formData.isPeriodic && periodoSelecionado && formData.collectionDate?.trim()) {
      if (!isCollectionDateInPeriod(formData.collectionDate, periodoSelecionado)) {
        toast.error("A data de coleta deve estar dentro do intervalo do período selecionado.");
        return;
      }
    }

    const address = `${cliente.usaAddress.rua}, ${cliente.usaAddress.numero}, ${cliente.usaAddress.cidade}, ${cliente.usaAddress.estado} ${cliente.usaAddress.zipCode}`;

    const isPeriodic = Boolean(formData?.isPeriodic);
    const comPeriodo = isPeriodic && Boolean(formData.appointmentPeriodId?.trim());
    const payload: CreateAppointmentsDTO = {
      clientId: formData.clientId,
      userId: formData.userId,
      collectionDate: comPeriodo ? undefined : (formData.collectionDate?.trim() ?? undefined),
      collectionTime: formData.collectionTime?.trim() ?? "",
      value: formData?.value ?? 0,
      downPayment: formData?.downPayment ?? 0,
      isPeriodic,
      qtyBoxes: qty,
      address,
      status: formData.status as
        | "PENDING"
        | "CONFIRMED"
        | "COLLECTED"
        | "CANCELLED",
      ...(formData.observations?.trim() ? { observations: formData.observations.trim() } : {}),
      ...(comPeriodo ? { appointmentPeriodId: formData.appointmentPeriodId!.trim() } : {}),
    };

    const result = await appointmentsService.create(payload);

    if (!result.success || !result.data) {
      toast.error(result.error ?? "Erro ao criar agendamento.");
      return;
    }

    addAgendamento(result.data);
    resetForm();
    resetFormPeriod();
    setIsPeriodic(false);
    setIsDialogOpen(false);
    toast.success("Agendamento criado com sucesso!");
  };

  const handleEditAgendamento = async (e: React.FormEvent, agendamento: Agendamento) => {
    e.preventDefault();

    const cliente = clientes.find((c) => c.id === formData.clientId);
    if (!cliente) {
      toast.error("Cliente não encontrado");
      return;
    }

    const periodoSelecionado = periodos.find((p) => p.id === formData.appointmentPeriodId);

    if (formData.isPeriodic && periodos.length === 0) {
      toast.error("Nenhum Período de Coleta encontrado. Crie um período de coleta para poder usar esta opção no agendamento.");
      return;
    }

    if (formData.isPeriodic && !periodoSelecionado) {
      toast.error("Nenhum Período de Coleta selecionado.");
      return;
    }

    if (!formData.status?.trim()) {
      toast.error("Selecione o status do agendamento.");
      return;
    }

    if (!formData.status?.trim()) {
      toast.error("Selecione o status do agendamento.");
      return;
    }

    const qty = Number(formData.qtyBoxes);
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error("Quantidade de caixas deve ser pelo menos 1.");
      return;
    }

    const getUpdatePayload = (): UpdateAppointmentsDTO => {
      const emptyStr = (v: string | undefined | null) => (v == null || String(v).trim() === "" ? "" : String(v).trim());
      const dateOnly = (v: string | undefined | null) => (emptyStr(v) ? String(v).trim().slice(0, 10) : "");
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
        status: formData.status as "PENDING" | "CONFIRMED" | "COLLECTED" | "CANCELLED",
        observations: emptyStr(formData.observations),
        appointmentPeriodId: formData.isPeriodic && formData.appointmentPeriodId?.trim() ? formData.appointmentPeriodId.trim() : "",
      };
      const original = selectedAgendamento!;
      const origObs = original.observations ?? "";
      const origCollectionTime = timeOnly(original.collectionTime);
      const origCollectionDate = dateOnly(original.collectionDate);
      const patch: UpdateAppointmentsDTO = {};

      if (current.clientId !== original.client?.id) patch.clientId = current.clientId;
      if (current.userId !== original.user?.id) patch.userId = current.userId;
      if (dateOnly(current.collectionDate) !== origCollectionDate) patch.collectionDate = current.collectionDate;
      if (timeOnly(current.collectionTime) !== origCollectionTime) patch.collectionTime = current.collectionTime;
      if (current.value !== original.value) patch.value = current.value;
      if (current.downPayment !== original.downPayment) patch.downPayment = current.downPayment;
      if (current.isPeriodic !== Boolean(original.isPeriodic)) patch.isPeriodic = current.isPeriodic;
      if (current.qtyBoxes !== original.qtyBoxes) patch.qtyBoxes = current.qtyBoxes;
      if (current.status !== original.status) patch.status = current.status;
      if (current.observations !== origObs) patch.observations = current.observations;
      const currPeriod = current.appointmentPeriodId ?? "";
      const origPeriod = original.appointmentPeriodId ?? "";
      if (currPeriod !== origPeriod) {
        patch.appointmentPeriodId = currPeriod || "";
        if (currPeriod && current.isPeriodic) patch.collectionDate = "";
      }
      return patch;
    }

    const patchPayload = getUpdatePayload();

    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    if (formData.isPeriodic && periodoSelecionado && formData.collectionDate?.trim()) {
      if (!isCollectionDateInPeriod(formData.collectionDate, periodoSelecionado)) {
        toast.error("A data de coleta deve estar dentro do intervalo do período selecionado.");
        return;
      }
    }

    const result = await appointmentsService.update(selectedAgendamento!.id!, patchPayload);
    if (result.success && result.data) {
      updateAgendamento(selectedAgendamento!.id!, result.data);
      setSelectedAgendamento(result.data);
      setIsEditDialogOpen(false);
      resetEditForm();
      resetForm();
      resetFormPeriod();
      setIsPeriodic(false);
      await carregarAgendamentos();
      toast.success("Agendamento atualizado com sucesso!");
    } else {
      toast.error(result.error ?? "Erro ao atualizar agendamento.");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: Agendamento["status"],
  ) => {
    const result = await appointmentsService.update(id, { status });
    if (result.success && result.data) {
      updateAgendamento(id, result.data);
      setSelectedAgendamento(null);
      await carregarAgendamentos();
      toast.success("Status atualizado!");
      return result.data;
    } else {
      toast.error(result.error ?? "Erro ao atualizar status do agendamento.");
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    const confirm = window.confirm(
      `Tem certeza que deseja excluir o agendamento de ${clientName}?`,
    );
    if (confirm) {
      const result = await appointmentsService.delete(id);
      if (result.success) {
        deleteAgendamento(id);
        setSelectedAgendamento(null);
        await carregarAgendamentos();
        toast.success("Agendamento excluído com sucesso!");
        return true;
      } else {
        toast.error(result.error ?? "Erro ao excluir agendamento.");
        return null;
      }
    } else {
      return null;
    }
  };

  /** Função para criar um novo período de coleta. */
  const handleCreatePeriodic = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyStr = (v: string | undefined | null) => (v == null || String(v).trim() === "" ? "" : String(v).trim());

    const payload: CreateAppointmentsPeriodsDTO = {
      title: formDataPeriod.title,
      startDate: emptyStr(formDataPeriod.startDate),
      endDate: emptyStr(formDataPeriod.endDate),
      collectionArea: formDataPeriod.collectionArea,
      status: formDataPeriod.status as Agendamento['status'],
      observations: formDataPeriod.observations ?? "",
    }

    if (formDataPeriod.startDate > formDataPeriod.endDate) {
      toast.error("A data de início não pode ser maior que a data de término.");
      return;
    }

    const result = await appointmentsService.createPeriod(payload);
    if (result.success && result.data) {
      setPeriodos([...periodos, result.data]);
      toast.success("Período de coleta criado com sucesso!");
      resetFormPeriod();
      setIsCreatePeriodicOpen(false);
    } else {
      toast.error(result.error ?? "Erro ao criar período de coleta.");
    }
  }

  // Edição do período de coleta: validação, confirmação (modal) e atualização centralizadas aqui
  const handleEditPeriod = async (e?: React.FormEvent, confirmed?: boolean) => {
    e?.preventDefault();

    if (!selectedPeriod) {
      toast.error("Período não selecionado.");
      return;
    }

    if (formDataPeriod.startDate > formDataPeriod.endDate) {
      toast.error("A data de início não pode ser maior que a data de término.");
      return;
    }

    const emptyStr = (v: string | undefined | null) =>
      v == null || String(v).trim() === "" ? "" : String(v).trim();
    const dateOnly = (v: string | undefined | null) =>
      emptyStr(v) ? String(v).trim().slice(0, 10) : "";

    const original = selectedPeriod;
    const origObs = original.observations ?? "";
    const patchPayload: UpdateAppointmentsPeriodsDTO = {};

    const current = {
      title: formDataPeriod.title,
      startDate: dateOnly(formDataPeriod.startDate),
      endDate: dateOnly(formDataPeriod.endDate),
      collectionArea: formDataPeriod.collectionArea,
      status: formDataPeriod.status as Agendamento["status"],
      observations: emptyStr(formDataPeriod.observations),
    };

    if (current.title !== original.title) patchPayload.title = current.title;
    if (current.startDate !== dateOnly(original.startDate)) patchPayload.startDate = current.startDate;
    if (current.endDate !== dateOnly(original.endDate)) patchPayload.endDate = current.endDate;
    if (current.collectionArea !== original.collectionArea)
      patchPayload.collectionArea = current.collectionArea;
    if (current.status !== original.status) patchPayload.status = current.status;
    if (current.observations !== origObs) patchPayload.observations = current.observations;

    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
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

    const result = await appointmentsService.updatePeriod(selectedPeriod.id!, payload);

    if (result.success && result.data) {
      toast.success("Período atualizado com sucesso!");
      setIsDialogEditPeriodOpen(false);
      resetFormPeriod();
      carregarPeriodos();
      carregarAgendamentos();
      setSelectedPeriod(result.data);
    } else {
      toast.error(result.error ?? "Erro ao atualizar período.");
    }
  };

  const statusConfig = {
    PENDING: {
      label: "Pendente",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgLight: "bg-yellow-50",
      icon: AlertCircle,
    },
    CONFIRMED: {
      label: "Confirmado",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgLight: "bg-green-50",
      icon: CheckCircle2,
    },
    COLLECTED: {
      label: "Coletado",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgLight: "bg-blue-50",
      icon: Package,
    },
    CANCELLED: {
      label: "Cancelado",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgLight: "bg-red-50",
      icon: XCircle,
    },
  } as const;

  type StatusKey = keyof typeof statusConfig;

  const statusKeyMap: Record<string, StatusKey> = {
    PENDING: "PENDING",
    PENDENTE: "PENDING",
    CONFIRMED: "CONFIRMED",
    CONFIRMADO: "CONFIRMED",
    COLLECTED: "COLLECTED",
    COLETADO: "COLLECTED",
    CANCELLED: "CANCELLED",
    CANCELADO: "CANCELLED",
  };

  /** Retorna a chave normalizada do status (PENDING | CONFIRMED | COLLECTED | CANCELLED). */
  const getStatusKey = (status: string): StatusKey =>
    statusKeyMap[(status ?? "").toUpperCase()] ?? "PENDING";

  /** Normaliza status (enum ou string em qualquer formato) para config (label, icon, cores). */
  const getStatusConfig = (status: string) =>
    statusConfig[getStatusKey(status)];

  const dataPickerBlocked = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  /** Quando é agendamento por período, limita o date picker ao intervalo do período (YYYY-MM-DD). */
  const periodDateBounds =
    formData.isPeriodic && formData.appointmentPeriodId
      ? (() => {
        const p = periodos.find((x) => x.id === formData.appointmentPeriodId);
        if (!p?.startDate || !p?.endDate) return { min: undefined, max: undefined };
        return {
          min: toYYYYMMDD(p.startDate) ?? undefined,
          max: toYYYYMMDD(p.endDate) ?? undefined,
        };
      })()
      : { min: undefined, max: undefined };
  const maxCollectionDateByPeriod = periodDateBounds.max;
  const minCollectionDateByPeriod = periodDateBounds.min;

  const carregarClientes = async () => {
    const result = await clientsService.getAll();
    if (result.success && result.data?.data) {
      setClientes(result.data.data);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter((agendamento) => {
      // Search
      const matchesSearch =
        agendamento.client.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        agendamento.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.user.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status (compara pela chave normalizada do enum)
      if (
        filters.status.length > 0 &&
        !filters.status.includes(getStatusKey(agendamento.status))
      ) {
        return false;
      }

      // Atendente Responsável
      if (
        filters.userId &&
        !agendamento.user.name
          .toLowerCase()
          .includes(filters.userId.toLowerCase())
      ) {
        return false;
      }

      // Período
      if (filters.periodo !== "todos") {
        const now = new Date();
        const agendamentoDate = new Date(
          (agendamento.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z",
        );

        if (filters.periodo === "hoje") {
          if (!isToday(agendamentoDate)) return false;
        } else if (filters.periodo === "semana") {
          const weekStart = startOfWeek(now, { locale: ptBR });
          const weekEnd = endOfWeek(now, { locale: ptBR });
          if (agendamentoDate < weekStart || agendamentoDate > weekEnd)
            return false;
        } else if (filters.periodo === "mes") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (agendamentoDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [agendamentos, searchTerm, filters]);

  const agendamentosDosDia = useMemo(() => {
    return filteredAgendamentos.filter((ag) =>
      isSameDay(
        new Date((ag.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
        selectedDate,
      ),
    );
  }, [filteredAgendamentos, selectedDate]);

  /** Agendamentos do período selecionado (quando usuário clica em um período). Inclui todos do período, inclusive sem data de coleta. */
  const agendamentosDoPeriodo = useMemo(() => {
    if (!selectedPeriod?.id) return [];
    return agendamentos.filter((agendamento) => {
      if ((agendamento.appointmentPeriodId ?? "") !== selectedPeriod.id) return false;
      const matchesSearch =
        agendamento.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.user.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filters.status.length > 0 && !filters.status.includes(getStatusKey(agendamento.status))) return false;
      if (filters.userId && !agendamento.user.name.toLowerCase().includes(filters.userId.toLowerCase())) return false;
      return true;
    });
  }, [agendamentos, selectedPeriod?.id, searchTerm, filters.status, filters.userId]);

  /** Agendamentos do período no dia selecionado (quando selectedDayInPeriod está definido). */
  const agendamentosDoPeriodoNoDia = useMemo(() => {
    if (!selectedPeriod?.id || !selectedDayInPeriod) return [];
    const dayStr = format(selectedDayInPeriod, "yyyy-MM-dd");
    return agendamentosDoPeriodo.filter((a) => (a.collectionDate ?? "").slice(0, 10) === dayStr);
  }, [agendamentosDoPeriodo, selectedPeriod?.id, selectedDayInPeriod]);

  const somaCaixasDoPeriodoNoDia = useMemo(() => {
    return agendamentosDoPeriodoNoDia.reduce((acc, a) => acc + (a.qtyBoxes ?? 0), 0);
  }, [agendamentosDoPeriodoNoDia]);

  /** Datas que pertencem ao intervalo do período selecionado (para destaque no calendário). */
  const getDatesInPeriodRange = useCallback(() => {
    if (!selectedPeriod?.startDate || !selectedPeriod?.endDate) return [];
    const start = parseLocalDate(selectedPeriod.startDate.slice(0, 10));
    const end = parseLocalDate(selectedPeriod.endDate.slice(0, 10));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
    const dates: Date[] = [];
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0, 0, 0);
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12, 0, 0, 0);
    while (d <= endDay) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [selectedPeriod?.startDate, selectedPeriod?.endDate]);

  /** Dias que têm agendamento dentro do período selecionado (para destacar no calendário ao clicar no período). */
  const getDatesWithAppointmentsInPeriod = useCallback(() => {
    if (!selectedPeriod?.id || agendamentosDoPeriodo.length === 0) return [];
    const dateSet = new Set<string>();
    agendamentosDoPeriodo.forEach((a) => {
      const d = (a.collectionDate ?? "").slice(0, 10);
      if (d.length === 10) dateSet.add(d);
    });
    return Array.from(dateSet).map((d) => parseLocalDate(d));
  }, [selectedPeriod?.id, agendamentosDoPeriodo]);

  const somaCaixasDosDia = useMemo(() => {
    return agendamentosDosDia.reduce((acc, a) => acc + a.qtyBoxes, 0);
  }, [agendamentosDosDia]);

  const statistics = useMemo(() => {
    const total = filteredAgendamentos.length;
    const pendentes = filteredAgendamentos.filter(
      (a) => a.status === "PENDING",
    ).length;
    const confirmados = filteredAgendamentos.filter(
      (a) => a.status === "CONFIRMED",
    ).length;
    const coletados = filteredAgendamentos.filter(
      (a) => a.status === "COLLECTED",
    ).length;
    const hoje = filteredAgendamentos.filter((a) =>
      isToday(
        new Date((a.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
      ),
    ).length;
    const amanha = filteredAgendamentos.filter((a) =>
      isTomorrow(
        new Date((a.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
      ),
    ).length;
    const atrasados = filteredAgendamentos.filter(
      (a) =>
        isPast(
          new Date((a.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
        ) &&
        a.status === "PENDING" &&
        !isToday(
          new Date((a.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
        ),
    ).length;

    return {
      total,
      pendentes,
      confirmados,
      coletados,
      hoje,
      amanha,
      atrasados,
    };
  }, [filteredAgendamentos]);

  const getDateLabel = (date: Date) => {
    if (isYesterday(date)) return "Ontem";
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const getDatesWithAgendamentos = useCallback(() => {
    const seen = new Set<string>();
    return agendamentos
      .map((a) => (a.collectionDate ?? "").slice(0, 10))
      .filter((d) => d.length === 10 && !seen.has(d) && (seen.add(d), true))
      .map((d) => parseLocalDate(d));
  }, [agendamentos]);

  /** Dias que têm ao mesmo tempo agendamento por grupo (isPeriodic) e agendamento único (!isPeriodic). */
  const getDatesWithGrupoEUnico = useCallback(() => {
    const byDate = new Map<string, { grupo: boolean; unico: boolean }>();
    agendamentos.forEach((a) => {
      const d = (a.collectionDate ?? "").slice(0, 10);
      if (d.length < 10) return;
      if (!byDate.has(d)) byDate.set(d, { grupo: false, unico: false });
      const cur = byDate.get(d)!;
      if (a.isPeriodic) cur.grupo = true;
      else cur.unico = true;
    });
    return Array.from(byDate.entries())
      .filter(([, v]) => v.grupo && v.unico)
      .map(([d]) => parseLocalDate(d));
  }, [agendamentos]);

  /** Dias em que há agendamento único e a data está dentro do intervalo de algum período (50% período, 50% único). */
  const getDatesUnicoDentroDePeriodo = useCallback(() => {
    const diasComUnico = new Set<string>();
    agendamentos.forEach((a) => {
      if (a.isPeriodic) return;
      const d = (a.collectionDate ?? "").slice(0, 10);
      if (d.length < 10) return;
      diasComUnico.add(d);
    });
    const result: Date[] = [];
    periodos.forEach((p) => {
      const startStr = toYYYYMMDD(p.startDate);
      const endStr = toYYYYMMDD(p.endDate);
      if (!startStr || !endStr) return;
      diasComUnico.forEach((dayStr) => {
        if (dayStr >= startStr && dayStr <= endStr) {
          result.push(parseLocalDate(dayStr));
        }
      });
    });
    const seen = new Set<string>();
    return result.filter((d) => {
      const key = d.toISOString().slice(0, 10);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [agendamentos, periodos]);

  /** Dias com agendamento que não são “grupo + único” nem “único dentro de período” (para não duplicar estilo no calendário). */
  const getDatesWithAgendamentosSomente = useCallback(() => {
    const grupoEUnicoSet = new Set(
      getDatesWithGrupoEUnico().map((d) => d.toISOString().slice(0, 10)),
    );
    const unicoDentroPeriodoSet = new Set(
      getDatesUnicoDentroDePeriodo().map((d) => d.toISOString().slice(0, 10)),
    );
    const all = getDatesWithAgendamentos();
    const seen = new Set<string>();
    return all.filter((d) => {
      const key = d.toISOString().slice(0, 10);
      if (grupoEUnicoSet.has(key)) return false;
      if (unicoDentroPeriodoSet.has(key)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [agendamentos, getDatesWithGrupoEUnico, getDatesUnicoDentroDePeriodo]);

  /** Dias que possuem ao menos um agendamento único (!isPeriodic). Usado quando nenhum período está selecionado. */
  const getDatesWithAgendamentoUnico = useCallback(() => {
    const dateSet = new Set<string>();
    agendamentos.forEach((a) => {
      if (a.isPeriodic) return;
      const d = (a.collectionDate ?? "").slice(0, 10);
      if (d.length === 10) dateSet.add(d);
    });
    return Array.from(dateSet).map((d) => parseLocalDate(d));
  }, [agendamentos]);

  /** Conjunto de datas que usam o gradiente 50% roxo / 50% verde (para não aplicar outros modificadores em cima). */
  const datesHalfHalfSet = useMemo(() => {
    const set = new Set<string>();
    getDatesWithGrupoEUnico().forEach((d) => set.add(format(d, "yyyy-MM-dd")));
    getDatesUnicoDentroDePeriodo().forEach((d) => set.add(format(d, "yyyy-MM-dd")));
    return set;
  }, [getDatesWithGrupoEUnico, getDatesUnicoDentroDePeriodo]);

  /** Intervalo do período excluindo dias que já têm o gradiente 50/50 (evita sobrescrever). */
  const getDatesInPeriodRangeOnlyNoHalfHalf = useCallback(() => {
    return getDatesInPeriodRange().filter((d) => !datesHalfHalfSet.has(format(d, "yyyy-MM-dd")));
  }, [getDatesInPeriodRange, datesHalfHalfSet]);

  /** Dias com agendamento no período excluindo os que já têm o gradiente 50/50 (evita sobrescrever). */
  const getDatesWithAppointmentsInPeriodNoHalfHalf = useCallback(() => {
    return getDatesWithAppointmentsInPeriod().filter((d) => !datesHalfHalfSet.has(format(d, "yyyy-MM-dd")));
  }, [getDatesWithAppointmentsInPeriod, datesHalfHalfSet]);

  const TimelineView = () => {
    const weekStart = startOfWeek(new Date(), { locale: ptBR });
    const weekEnd = endOfWeek(new Date(), { locale: ptBR });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        {daysOfWeek.map((day) => {
          const dayAgendamentos = filteredAgendamentos.filter((ag) =>
            isSameDay(
              new Date(
                (ag.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z",
              ),
              day,
            ),
          );

          return (
            <Card
              key={day.toString()}
              className={`${isToday(day) ? "border-blue-500 border-2" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      {dayAgendamentos.length} agendamento(s)
                    </CardDescription>
                  </div>
                  {isToday(day) && <Badge className="bg-blue-500">Hoje</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {dayAgendamentos.length > 0 ? (
                  <div className="space-y-2">
                    {dayAgendamentos
                      .sort((a, b) =>
                        a.collectionTime.localeCompare(b.collectionTime),
                      )
                      .map((agendamento) => {
                        const config = getStatusConfig(agendamento.status);
                        const StatusIcon = config.icon;

                        return (
                          <motion.div
                            key={agendamento.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-lg border-l-4 ${config.bgLight} hover:shadow-md transition-all cursor-pointer`}
                            style={{
                              borderLeftColor: config.color
                                .replace("bg-", "#")
                                .replace("500", "600"),
                            }}
                            onClick={() => { setSelectedAgendamento(agendamento); setIsSidePanelOpen(true); }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`p-2 rounded-full ${config.color} bg-opacity-20`}
                                >
                                  <StatusIcon
                                    className={`w-4 h-4 ${config.textColor}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">
                                      {agendamento.collectionTime}
                                    </span>
                                    <span className="text-muted-foreground">
                                      •
                                    </span>
                                    <span>{agendamento.client.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">
                                      {agendamento.address}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Box className="w-3 h-3" />
                                    <span className="truncate">
                                      {agendamento.qtyBoxes} Caixa(s)
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge className={config.bgLight}>
                                <span className={config.textColor}>
                                  {config.label}
                                </span>
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum agendamento para este dia
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Agendamentos
            </h2>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Gerencie coletas de caixas e entregas
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            {/* Confirmação ao salvar edição do período (realocação dos agendamentos) */}
            <AlertDialog open={confirmEditPeriodOpen} onOpenChange={setConfirmEditPeriodOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar alterações no período?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Os agendamentos vinculados a este período serão realocados: ficarão sem data de coleta definida, mas continuarão dentro do período e poderão ser reagendados no novo intervalo. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleEditPeriod(undefined, true)}>
                    Confirmar alterações
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Criação de Período de Coleta */}
            <Dialog
              open={isCreatePeriodicOpen}
              onOpenChange={(open) => {
                setIsCreatePeriodicOpen(open);
                if (open) {
                  resetFormPeriod();
                } else {
                  resetFormPeriod();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Período de Coleta
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg mx-2 sm:mx-4">
                <DialogHeader>
                  <DialogTitle>Novo Período</DialogTitle>
                  <DialogDescription>
                    Crie um novo período de coleta de caixas
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreatePeriodic} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formDataPeriod.title}
                      onChange={(e) => {
                        setFormDataPeriod({ ...formDataPeriod, title: e.target.value })
                      }}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Data de Início *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        min={dataPickerBlocked()}
                        max={formDataPeriod.endDate}
                        value={formDataPeriod.startDate}
                        onChange={(e) => {
                          setFormDataPeriod({ ...formDataPeriod, startDate: e.target.value })
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data de Fim *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        min={formDataPeriod.startDate ? formDataPeriod.startDate : dataPickerBlocked()}
                        value={formDataPeriod.endDate}
                        onChange={(e) => {
                          setFormDataPeriod({ ...formDataPeriod, endDate: e.target.value })
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collectionArea">Área de Coleta *</Label>
                      <Input
                        id="collectionArea"
                        type="text"
                        value={formDataPeriod.collectionArea}
                        onChange={(e) => {
                          setFormDataPeriod({ ...formDataPeriod, collectionArea: e.target.value })
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formDataPeriod.status}
                        onValueChange={(value) => {
                          setFormDataPeriod({ ...formDataPeriod, status: value })
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendente</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                          <SelectItem value="COLLECTED">Coletado</SelectItem>
                          <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={formDataPeriod.observations}
                      onChange={(e) => {
                        setFormDataPeriod({ ...formDataPeriod, observations: e.target.value })
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => {
                      resetFormPeriod();
                      setIsCreatePeriodicOpen(false);
                    }}>Cancelar</Button>
                    <Button type="submit">Criar Período</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Diálogo de Criação de Agendamento */}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                carregarClientes();
                if (open) {
                  resetForm();
                }
                if (!open) {
                  resetForm();
                  resetEditForm();
                  setQtdCaixasPorDia([]);
                  setQtdCaixasPorPeriodo([]);
                  setIsPeriodic(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg mx-2 sm:mx-4">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                  <DialogDescription>
                    Agende uma coleta de caixas
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Cliente *</Label>
                    <Select
                      value={formData.clientId}
                      disabled={!clientesAtivos.length}
                      onValueChange={(value) =>
                        setFormData({ ...formData, clientId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientesAtivos.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.usaNome} -{" "}
                            {cliente.usaAddress.cidade as string},{" "}
                            {cliente.usaAddress.estado as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!clientesAtivos.length && (
                    <EmptyStateAlert
                      title="Nenhum cliente ativo"
                      description="Não há clientes ativos para agendamento. Cadastre um cliente ou ative um existente. O campo Cliente ficará desabilitado até que exista ao menos um cliente ativo."
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">Data da Coleta {formData.isPeriodic ? '' : '*'}</Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        min={minCollectionDateByPeriod ?? dataPickerBlocked()}
                        max={maxCollectionDateByPeriod}
                        value={formData.collectionDate}
                        required={!formData.isPeriodic}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            collectionDate: e.target.value,
                          });
                          carregarQtdCaixasPorDia(e.target.value, formData.isPeriodic, formData.appointmentPeriodId);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionTime">Horário Previsto</Label>
                      <Input
                        id="collectionTime"
                        type="time"
                        value={formData.collectionTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            collectionTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <AppointmentBoxesPerDayAlert
                    qtdCaixasPorDia={qtdCaixasPorDia}
                    collectionDate={formData.collectionDate}
                    qtyAllowed={13}
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50/95 dark:bg-slate-900/70 dark:border-slate-700 px-4 py-4 mt-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="isPeriodic"
                          className="text-xs font-semibold text-slate-900 dark:text-slate-50"
                        >
                          Período de Coleta
                        </Label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Ative para definir um intervalo de datas recorrentes para este agendamento.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formData.isPeriodic ? "Ativado" : "Desativado"}
                        </span>
                        <Switch
                          id="isPeriodic"
                          checked={formData.isPeriodic}
                          onCheckedChange={(checked) => {
                            setIsPeriodic(checked);
                            carregarQtdCaixasPorDia(formData.collectionDate, checked, checked ? formData.appointmentPeriodId : "");
                            carregarPeriodos();
                            setFormData((prev) => ({
                              ...prev,
                              isPeriodic: checked,
                              ...(checked ? {} : { appointmentPeriodId: "" }),
                            }));
                            if (!checked) setQtdCaixasPorPeriodo([]);
                          }}
                        />
                      </div>
                    </div>

                    {formData.isPeriodic && (
                      periodos.length > 0 ? (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="pt-2"
                          >
                            <div className="grid grid-cols-1 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="appointmentPeriodId">Selecione o Período de Coleta *</Label>
                                <Select
                                  value={formData.appointmentPeriodId}
                                  onValueChange={(value) => {
                                    setFormData((prev) => {
                                      const period = periodos.find((p) => String(p.id ?? "") === String(value));
                                      if (period?.startDate != null && period?.endDate != null) {
                                        const startStr =
                                          typeof period.startDate === "string"
                                            ? period.startDate.slice(0, 10)
                                            : new Date(period.startDate).toISOString().slice(0, 10);
                                        const endStr =
                                          typeof period.endDate === "string"
                                            ? period.endDate.slice(0, 10)
                                            : new Date(period.endDate).toISOString().slice(0, 10);
                                        carregarQtdCaixasPorDia(prev.collectionDate, prev.isPeriodic, value);
                                        carregarQtdCaixasPorPeriodo(startStr, endStr);
                                      } else {
                                        setQtdCaixasPorPeriodo([]);
                                      }
                                      return { ...prev, appointmentPeriodId: value };
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o período de coleta" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {periodos.map((period) => (
                                      <SelectItem key={period.id ?? ""} value={period.id ?? ""}>
                                        {period.title} - ({period.collectionArea}) : {formatDateOnlyToBR(toDateOnly(String(period.startDate)))} – {formatDateOnlyToBR(toDateOnly(String(period.endDate)))}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <div className="pt-2">
                          <EmptyStateAlert
                            title="Nenhum período de coleta encontrado"
                            description="Cadastre um período de coleta para poder usar esta opção no agendamento."
                          />
                        </div>
                      )
                    )}
                  </div>

                  {formData.isPeriodic && periodos.length > 0 && formData.appointmentPeriodId && (
                    <AppointmentBoxesPerPeriodAlert items={qtdCaixasPorPeriodo} />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">Valor Total *</Label>
                      <Input
                        id="value"
                        type="number"
                        required
                        min={1}
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">Valor do Pagamento Antecipado</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        min={0.00}
                        value={formData.downPayment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            downPayment: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qtyBoxes">Quantidade de caixas *</Label>
                    <Input
                      id="qtyBoxes"
                      type="number"
                      required
                      min={1}
                      value={formData.qtyBoxes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qtyBoxes: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <AtendenteSelect
                    user={user ? { id: user.id, nome: user.nome } : null}
                    value={formData.userId}
                    onValueChange={(id) =>
                      setFormData({ ...formData, userId: id })
                    }
                    label="Atendente *"
                    required
                  />

                  {/* Definir Status */}
                  <div className="space-y-2">
                    <Label htmlFor="setStatus">Status *</Label>
                    <Select
                      required
                      value={formData.status || undefined}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          status: value as Agendamento["status"],
                        });
                      }}
                    >
                      <SelectTrigger id="setStatus" required aria-required>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                        <SelectItem value="COLLECTED">Coletado</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observations: e.target.value,
                        })
                      }
                      placeholder="Informações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        resetEditForm();
                        setIsDialogOpen(false);
                        setIsPeriodic(false);
                        setQtdCaixasPorDia([]);
                        setQtdCaixasPorPeriodo([]);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Agendar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <Card className="p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-blue-900">
                Hoje
              </span>
              <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-900">
              {statistics.hoje}
            </p>
            <p className="text-xs text-blue-700 mt-1">Agendamentos</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-purple-900">
                Amanhã
              </span>
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-purple-900">
              {statistics.amanha}
            </p>
            <p className="text-xs text-purple-700 mt-1">Programados</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-yellow-900">
                Pendentes
              </span>
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-yellow-900">
              {statistics.pendentes}
            </p>
            <p className="text-xs text-yellow-700 mt-1">Aguardando</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-green-900">
                Confirmados
              </span>
              <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-900">
              {statistics.confirmados}
            </p>
            <p className="text-xs text-green-700 mt-1">Prontos</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-red-900">
                Atrasados
              </span>
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-red-900">
              {statistics.atrasados}
            </p>
            <p className="text-xs text-red-700 mt-1">Urgente</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-slate-900">
                Total
              </span>
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900">
              {statistics.total}
            </p>
            <p className="text-xs text-slate-700 mt-1">Agendamentos</p>
          </Card>
        </div>

        {/* Barra de Busca e View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode - Compacto em Mobile */}
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex-1 sm:flex-none"
            >
              <CalendarIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Calendário</span>
            </Button>
            <Button
              variant={viewMode === "timeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("timeline")}
              className="flex-1 sm:flex-none"
            >
              <LayoutGrid className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Timeline</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1 sm:flex-none"
            >
              <List className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
          </div>
        </div>

        {/* Card de Períodos de Coleta - embaixo da barra de pesquisa, em cima do calendário */}
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Períodos de Coleta
            </CardTitle>
            <CardDescription>Clique em um período para ver agendamentos e resumo</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {periodos.length > 0 ? (
              <div className="space-y-3">
                {periodos.map((periodo) => {
                  const startStr = (periodo.startDate ?? "").slice(0, 10);
                  const endStr = (periodo.endDate ?? "").slice(0, 10);
                  const isSelected = selectedPeriod?.id === periodo.id;
                  const count = agendamentos.filter((a) => (a.appointmentPeriodId ?? "") === periodo.id).length;
                  const dateRange =
                    startStr && endStr
                      ? `${formatDateOnlyToBR(startStr)} – ${formatDateOnlyToBR(endStr)}`
                      : "";
                  return (
                    <Card
                      key={periodo.id ?? ""}
                      className={cn(
                        "border-l-4 hover:shadow-xl transition-all cursor-pointer",
                        isSelected ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
                      )}
                      style={{
                        borderLeftColor: isSelected ? "rgb(37, 99, 235)" : "rgb(100, 116, 139)",
                      }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPeriod(null);
                          setSelectedDayInPeriod(null);
                        } else {
                          setSelectedPeriod(periodo);
                          const firstDay = periodo?.startDate ? parseLocalDate(periodo.startDate.slice(0, 10)) : null;
                          setSelectedDayInPeriod(firstDay && !Number.isNaN(firstDay.getTime()) ? firstDay : null);
                        }
                        setIsSidePanelOpen(false);
                        setViewMode("calendar");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-lg text-foreground">
                                  {periodo.title}
                                </span>
                                {count > 0 && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs">
                                    {count} agendamento(s).
                                  </Badge>
                                )}
                              </div>
                              {periodo.collectionArea && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{periodo.collectionArea}</span>
                                </div>
                              )}
                              {dateRange && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span>{dateRange}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Editar Período */}
                            <Dialog
                              open={isDialogEditPeriodOpen && selectedPeriod?.id === periodo.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setSelectedPeriod(periodo);
                                  fillEditFormPeriodFrom(periodo);
                                  setIsDialogEditPeriodOpen(true);
                                } else {
                                  resetFormPeriod();
                                  setIsDialogEditPeriodOpen(false);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  title="Editar período"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg mx-2 sm:mx-4">
                                <DialogHeader>
                                  <DialogTitle>Editar Período</DialogTitle>
                                  <DialogDescription>Edite as informações do período. Os agendamentos vinculados serão realocados.</DialogDescription>
                                </DialogHeader>
                                <form id="form-edit-period" onSubmit={handleEditPeriod}>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="titleEdit">Título *</Label>
                                      <Input
                                        id="titleEdit"
                                        name="titleEdit"
                                        value={formDataPeriod.title}
                                        onChange={(e) => setFormDataPeriod({ ...formDataPeriod, title: e.target.value })}
                                        required
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="startDateEdit">Data de Início *</Label>
                                        <Input
                                          id="startDateEdit"
                                          type="date"
                                          min={dataPickerBlocked()}
                                          max={formDataPeriod.endDate}
                                          value={formDataPeriod.startDate}
                                          onChange={(e) => setFormDataPeriod({ ...formDataPeriod, startDate: e.target.value })}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="endDateEdit">Data de Fim *</Label>
                                        <Input
                                          id="endDateEdit"
                                          type="date"
                                          min={formDataPeriod.startDate ? formDataPeriod.startDate : dataPickerBlocked()}
                                          value={formDataPeriod.endDate}
                                          onChange={(e) => setFormDataPeriod({ ...formDataPeriod, endDate: e.target.value })}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="collectionAreaEdit">Área de Coleta *</Label>
                                        <Input
                                          id="collectionAreaEdit"
                                          value={formDataPeriod.collectionArea}
                                          onChange={(e) => setFormDataPeriod({ ...formDataPeriod, collectionArea: e.target.value })}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="observationsEdit">Status *</Label>
                                        <Select
                                          value={formDataPeriod.status}
                                          onValueChange={(value) => setFormDataPeriod({ ...formDataPeriod, status: value })}
                                          required
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                            <SelectContent>
                                              <SelectItem value="PENDING">Pendente</SelectItem>
                                              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                                              <SelectItem value="COLLECTED">Coletado</SelectItem>
                                              <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                            </SelectContent>
                                          </SelectTrigger>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="observationsEdit">Observações</Label>
                                      <Textarea
                                        id="observationsEdit"
                                        value={formDataPeriod.observations}
                                        onChange={(e) => setFormDataPeriod({ ...formDataPeriod, observations: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </form>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      resetFormPeriod();
                                      setIsDialogEditPeriodOpen(false);
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button type="submit" form="form-edit-period">Salvar Alterações</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Visualizar no menu lateral"
                              onClick={() => {
                                setSelectedPeriod(periodo);
                                const firstDay = periodo?.startDate ? parseLocalDate(periodo.startDate.slice(0, 10)) : null;
                                setSelectedDayInPeriod(firstDay && !Number.isNaN(firstDay.getTime()) ? firstDay : null);
                                setSelectedAgendamento(null);
                                setIsSidePanelOpen(true);
                              }}
                            >
                              <PanelRightOpen className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <p className="text-sm">Nenhum registro de período de coleta encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel de Filtros - UX Melhorada */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="space-y-4">
                  {/* Filtro de Período */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-slate-700">
                      📅 Período
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(["todos", "hoje", "semana", "mes"] as const).map(
                        (periodo) => (
                          <Badge
                            key={periodo}
                            onClick={() => setFilters({ ...filters, periodo })}
                            className={`cursor-pointer px-4 py-2 transition-all ${filters.periodo === periodo
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                              }`}
                          >
                            {periodo === "todos" && "Todos"}
                            {periodo === "hoje" && "Hoje"}
                            {periodo === "semana" && "Esta Semana"}
                            {periodo === "mes" && "Este Mês"}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Filtro de Status */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-slate-700">
                      🏷️ Status{" "}
                      {filters.status.length > 0 &&
                        `(${filters.status.length})`}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(
                        [
                          "PENDING",
                          "CONFIRMED",
                          "COLLECTED",
                          "CANCELLED",
                        ] as const
                      ).map((s) => {
                        const config = statusConfig[s];
                        const isSelected = filters.status.includes(s);
                        return (
                          <Badge
                            key={s}
                            onClick={() => {
                              setFilters({
                                ...filters,
                                status: isSelected
                                  ? filters.status.filter((x) => x !== s)
                                  : [...filters.status, s],
                              });
                            }}
                            className={`cursor-pointer px-4 py-2 transition-all flex items-center gap-2 ${isSelected
                              ? `${config.color} text-white`
                              : `bg-white ${config.textColor} border border-slate-300 hover:bg-slate-100`
                              }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                            {config.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtro de Atendente */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-slate-700">
                      👤 Atendente
                    </label>
                    <Input
                      placeholder="Digite o nome da atendente..."
                      value={filters.userId}
                      onChange={(e) =>
                        setFilters({ ...filters, userId: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-600">
                    {filteredAgendamentos.length} agendamento(s) encontrado(s)
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        status: [],
                        userId: "",
                        periodo: "todos",
                      })
                    }
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar Filtros
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Views */}
      {
        viewMode === "calendar" && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>Selecione uma data</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedPeriod ? (selectedDayInPeriod ?? undefined) : selectedDate}
                  onSelect={(date) => {
                    if (!date) return;
                    if (selectedPeriod) {
                      const isSameDay = selectedDayInPeriod && format(date, "yyyy-MM-dd") === format(selectedDayInPeriod, "yyyy-MM-dd");
                      setSelectedDayInPeriod(isSameDay ? null : date);
                    } else {
                      setSelectedDate(date);
                    }
                  }}
                  locale={ptBR}
                  className="rounded-md border calendar-appointments"
                  numberOfMonths={1}
                  classNames={{
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-md",
                    day: "rdp-day size-8 p-0 font-normal aria-selected:opacity-100 rounded-md cursor-pointer",
                    day_today: "calendar-day-today",
                    day_selected: "calendar-day-selected",
                  }}
                  modifiers={{
                    ...(!selectedPeriod
                      ? { agendado: getDatesWithAgendamentos() }
                      : {}),
                    ...(selectedPeriod
                      ? {
                        diaGrupoEUnico: getDatesWithGrupoEUnico(),
                        diaUnicoDentroPeriodo: getDatesUnicoDentroDePeriodo(),
                        periodInterval: getDatesInPeriodRangeOnlyNoHalfHalf(),
                        periodAppointmentDay: getDatesWithAppointmentsInPeriodNoHalfHalf(),
                      }
                      : {}),
                  }}
                  modifiersClassNames={{
                    ...(!selectedPeriod ? { agendado: "calendar-day-agendado" } : {}),
                    ...(selectedPeriod
                      ? {
                        diaGrupoEUnico: "calendar-day-half-half",
                        diaUnicoDentroPeriodo: "calendar-day-half-half",
                        periodInterval: "calendar-day-period-interval",
                        periodAppointmentDay: "calendar-day-period-appointment",
                      }
                      : {}),
                  }}
                  modifiersStyles={{
                    ...(!selectedPeriod
                      ? {
                        agendado: {
                          background: "rgba(139, 92, 246, 0.6)",
                          color: "#fff",
                          fontWeight: "600",
                          borderRadius: "6px",
                          border: "1px solid rgb(255, 255, 255)",
                        },
                      }
                      : {}),
                    ...(selectedPeriod
                      ? {
                        diaGrupoEUnico: {
                          background: "linear-gradient(90deg, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(187, 247, 208, 0.6) 50%, rgba(187, 247, 208, 0.6) 100%)",
                          color: "#0f172a",
                          border: "1px solid rgb(255, 255, 255)",
                          fontWeight: "600",
                          borderRadius: "6px",
                        },
                        diaUnicoDentroPeriodo: {
                          background: "linear-gradient(90deg, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(187, 247, 208, 0.6) 50%, rgba(187, 247, 208, 0.6) 100%)",
                          color: "#0f172a",
                          border: "1px solid rgb(255, 255, 255)",
                          fontWeight: "600",
                          borderRadius: "6px",
                        },
                      }
                      : {}),
                    ...(selectedPeriod
                      ? {
                        periodInterval: {
                          background: "rgba(187, 247, 208, 0.6)",
                          color: "#0f172a",
                          fontWeight: "600",
                          border: "1px solid rgb(255, 255, 255)",
                          borderRadius: "6px",
                        },
                        periodAppointmentDay: {
                          background: "linear-gradient(90deg, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(187, 247, 208, 0.6) 50%, rgba(187, 247, 208, 0.6) 100%)",
                          color: "#0f172a",
                          border: "1px solid rgb(255, 255, 255)",
                          borderRadius: "6px",
                          fontWeight: "600",
                        },
                      }
                      : {}),
                  }}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedPeriod
                    ? selectedPeriod.title
                    : getDateLabel(selectedDate)}
                </CardTitle>
                <CardDescription>
                  <span className="flex flex-col items-start gap-2 text-sm text-muted-foreground mt-2">
                    {selectedPeriod ? (
                      <>
                        <span className="text-foreground">
                          {selectedPeriod.startDate && selectedPeriod.endDate
                            ? `${formatDateOnlyToBR(selectedPeriod.startDate.slice(0, 10))} – ${formatDateOnlyToBR(selectedPeriod.endDate.slice(0, 10))}`
                            : "—"}
                        </span>
                        <span className="font-bold text-foreground">
                          {selectedDayInPeriod ? (
                            <>Dia: {format(selectedDayInPeriod, "dd/MM/yyyy", { locale: ptBR })} • {agendamentosDoPeriodoNoDia.length} agendamento(s){agendamentosDoPeriodoNoDia.length > 0 && ` • ${somaCaixasDoPeriodoNoDia} caixa(s)`}</>
                          ) : (
                            <>{agendamentosDoPeriodo.length} agendamento(s) no período{agendamentosDoPeriodo.length > 0 && ` • ${agendamentosDoPeriodo.reduce((acc, a) => acc + (a.qtyBoxes ?? 0), 0)} caixa(s)`}</>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-foreground">
                          {agendamentosDosDia.length} agendamento(s) programado(s)
                        </span>
                        <span className="font-bold text-foreground">
                          {somaCaixasDosDia} Caixa(s) do dia.
                        </span>
                      </>
                    )}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPeriod && selectedDayInPeriod && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDayInPeriod(null)}
                    >
                      Ver todos os dias do período
                    </Button>
                  )}
                  <AnimatePresence>
                    {(selectedPeriod
                      ? (selectedDayInPeriod ? agendamentosDoPeriodoNoDia : agendamentosDoPeriodo)
                      : agendamentosDosDia)
                      .slice()
                      .sort((a, b) => {
                        if (selectedPeriod && !selectedDayInPeriod) {
                          const dateCmp = (a.collectionDate ?? "").localeCompare(b.collectionDate ?? "");
                          if (dateCmp !== 0) return dateCmp;
                        }
                        return (a.collectionTime ?? "").localeCompare(b.collectionTime ?? "");
                      })
                      .map((agendamento) => {
                        const config = getStatusConfig(agendamento.status);
                        const StatusIcon = config.icon;
                        const timeLabel = (agendamento.collectionTime ?? "").trim() || "—";

                        return (
                          <motion.div
                            key={agendamento.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group"
                          >
                            <Card
                              className={`border-l-4 hover:shadow-xl transition-all cursor-pointer ${config.bgLight}`}
                              style={{
                                borderLeftColor: config.color
                                  .replace("bg-", "#")
                                  .replace("500", "600"),
                              }}
                              onClick={() => { setSelectedAgendamento(agendamento); setIsSidePanelOpen(true); }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div
                                      className={`p-2 rounded-full ${config.color} bg-opacity-20`}
                                    >
                                      <StatusIcon
                                        className={`w-5 h-5 ${config.textColor}`}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={selectedPeriod ? "font-semibold text-base" : "font-semibold text-lg"}>
                                          {selectedPeriod && !selectedDayInPeriod
                                            ? `${formatDateOnlyToBR((agendamento.collectionDate ?? "").slice(0, 10)) || "Sem data"} · ${timeLabel}`
                                            : selectedPeriod && selectedDayInPeriod
                                              ? `${format(selectedDayInPeriod, "dd/MM/yyyy", { locale: ptBR })} · ${timeLabel}`
                                              : (agendamento.collectionTime ?? "").trim() || "—"}
                                        </span>
                                        <Badge className={config.bgLight}>
                                          <span className={config.textColor}>
                                            {config.label}
                                          </span>
                                        </Badge>
                                      </div>
                                      <h4 className="font-semibold mb-1">
                                        {agendamento.client.name}
                                      </h4>
                                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{agendamento.address}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          <span>{agendamento.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Box className="w-3 h-3 text-foreground" />
                                          <span className="font-bold text-xs text-foreground">
                                            {agendamento.qtyBoxes} Caixa(s)
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agendamento.address)}`,
                                          "_blank",
                                        );
                                      }}
                                    >
                                      <Navigation className="w-4 h-4 mr-1" />
                                      Rota
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>

                  {(selectedPeriod
                    ? (selectedDayInPeriod ? agendamentosDoPeriodoNoDia.length === 0 : agendamentosDoPeriodo.length === 0)
                    : agendamentosDosDia.length === 0) && (
                      <div className="text-center py-12 text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>
                          {selectedPeriod
                            ? selectedDayInPeriod
                              ? "Nenhum agendamento neste dia do período"
                              : "Nenhum agendamento neste período"
                            : "Nenhum agendamento para esta data"}
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {viewMode === "timeline" && <TimelineView />}

      {
        viewMode === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>Todos os Agendamentos</CardTitle>
              <CardDescription>
                {filteredAgendamentos.length} agendamento(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAgendamentos
                  .sort((a, b) => {
                    const dateCompare = (a.collectionDate ?? "").localeCompare(
                      b.collectionDate ?? "",
                    );
                    if (dateCompare !== 0) return dateCompare;
                    return a.collectionTime.localeCompare(b.collectionTime);
                  })
                  .map((agendamento) => {
                    const config = getStatusConfig(agendamento.status);
                    const StatusIcon = config.icon;
                    const dateStr = (agendamento.collectionDate ?? "").slice(
                      0,
                      10,
                    );
                    const agDate =
                      dateStr.length >= 10
                        ? new Date(dateStr + "T12:00:00.000Z")
                        : new Date(NaN);
                    const isAtrasado =
                      !Number.isNaN(agDate.getTime()) &&
                      isPast(agDate) &&
                      getStatusKey(agendamento.status) === "PENDING" &&
                      !isToday(agDate);

                    return (
                      <motion.div
                        key={agendamento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card
                          className={`border-l-4 hover:shadow-xl transition-all cursor-pointer ${isAtrasado
                            ? "bg-red-50 border-red-500"
                            : config.bgLight
                            }`}
                          style={{
                            borderLeftColor: isAtrasado
                              ? "#EF4444"
                              : config.color
                                .replace("bg-", "#")
                                .replace("500", "600"),
                          }}
                          onClick={() => { setSelectedAgendamento(agendamento); setIsSidePanelOpen(true); }}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                                <div
                                  className={`p-2 rounded-full ${config.color} bg-opacity-20 flex-shrink-0`}
                                >
                                  <StatusIcon
                                    className={`w-5 h-5 ${config.textColor}`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="font-semibold text-sm sm:text-base">
                                      {dateStr ?
                                        (formatDateOnlyToBR(dateStr) || '--/--/----')
                                        : '--/--/----'}
                                    </span>
                                    <span className="text-muted-foreground">
                                      •
                                    </span>
                                    <span className="font-semibold text-sm sm:text-base">
                                      {agendamento.collectionTime
                                        ? agendamento.collectionTime
                                        : "--:--"}
                                    </span>
                                    <Badge className={config.bgLight}>
                                      <span className={config.textColor}>
                                        {config.label}
                                      </span>
                                    </Badge>
                                    {isAtrasado && (
                                      <Badge className="bg-red-100">
                                        <span className="text-red-700">
                                          Atrasado
                                        </span>
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-semibold mb-1 truncate">
                                    {agendamento.client.name}
                                  </h4>
                                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2 break-words">
                                      {agendamento.address}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {agendamento.user.name}
                                      </span>
                                    </div>
                                    {agendamento.observations && (
                                      <span className="text-xs italic line-clamp-1 break-words flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3" />
                                        {":"} {agendamento.observations}
                                      </span>
                                    )}
                                    <span className="text-xs font-bold text-foreground line-clamp-1 break-words flex items-center gap-1">
                                      <Box className="w-3 h-3 text-foreground" />
                                      {":"} {agendamento.qtyBoxes} {""}{" "}
                                      {"Caixa(s)"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agendamento.address)}`,
                                      "_blank",
                                    );
                                  }}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Navigation className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                {filteredAgendamentos.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Painel Lateral - Período (resumo agregado) ou Detalhes do Agendamento */}
      <AnimatePresence>
        {isSidePanelOpen && (selectedPeriod || selectedAgendamento) && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[500px] bg-white dark:bg-slate-900 shadow-2xl border-l border-border z-50 overflow-y-auto"
          >
            {selectedPeriod ? (
              <>
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border p-6 z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        {selectedPeriod.title}
                      </h2>
                      {selectedPeriod.startDate && selectedPeriod.endDate && (
                        <p className="text-sm text-muted-foreground">
                          {formatDateOnlyToBR(selectedPeriod.startDate.slice(0, 10))} – {formatDateOnlyToBR(selectedPeriod.endDate.slice(0, 10))}
                        </p>
                      )}
                      {selectedPeriod.collectionArea?.trim() && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {selectedPeriod.collectionArea}
                        </p>
                      )}
                      {selectedPeriod.status && (
                        <Badge className={getStatusConfig(selectedPeriod.status).bgLight + " mt-3"} variant="secondary">
                          <span className={getStatusConfig(selectedPeriod.status).textColor}>
                            {getStatusConfig(selectedPeriod.status).label}
                          </span>
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedPeriod(null); setIsSidePanelOpen(false); }}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Resumo agregado do período */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Clientes</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{agendamentosDoPeriodo.length}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Total de caixas</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {agendamentosDoPeriodo.reduce((acc, a) => acc + (a.qtyBoxes ?? 0), 0)}
                      </p>
                    </Card>
                  </div>
                  {/* Atendentes (únicos) */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Atendentes
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {Array.from(new Set(agendamentosDoPeriodo.map((a) => a.user?.name).filter(Boolean))).map((name) => (
                        <li key={name} className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          {name}
                        </li>
                      ))}
                      {agendamentosDoPeriodo.length > 0 && agendamentosDoPeriodo.every((a) => !a.user?.name) && (
                        <li className="text-muted-foreground">—</li>
                      )}
                      {agendamentosDoPeriodo.length === 0 && <li className="text-muted-foreground">Nenhum agendamento neste período</li>}
                    </ul>
                  </div>
                  {/* Caixas por cliente (agrupado) */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      Caixas por cliente
                    </h3>
                    <ul className="space-y-2">
                      {agendamentosDoPeriodo
                        .sort((a, b) => (b.qtyBoxes ?? 0) - (a.qtyBoxes ?? 0))
                        .map((a) => (
                          <li
                            key={a.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => {
                              setSelectedPeriod(null);
                              setSelectedAgendamento(a);
                            }}
                          >
                            <span className="font-medium truncate max-w-[200px]">{a.client?.name ?? "—"}</span>
                            <Badge variant="secondary">{a.qtyBoxes ?? 0} caixas</Badge>
                          </li>
                        ))}
                      {agendamentosDoPeriodo.length === 0 && (
                        <li className="text-sm text-muted-foreground py-2">Nenhum agendamento neste período</li>
                      )}
                    </ul>
                  </div>
                  {/* Lista de agendamentos do período */}
                  <div>
                    <h3 className="font-semibold mb-2">Agendamentos do período</h3>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {agendamentosDoPeriodo
                        .sort((a, b) => (a.collectionDate ?? "").localeCompare(b.collectionDate ?? "") || (a.collectionTime ?? "").localeCompare(b.collectionTime ?? ""))
                        .map((ag) => {
                          const config = getStatusConfig(ag.status);
                          const StatusIcon = config.icon;
                          return (
                            <Card
                              key={ag.id}
                              className={cn("p-3 cursor-pointer border-l-4", config.bgLight)}
                              style={{ borderLeftColor: config.color.replace("bg-", "#").replace("500", "600") }}
                              onClick={() => {
                                setSelectedPeriod(null);
                                setSelectedAgendamento(ag);
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <StatusIcon className={cn("w-4 h-4 flex-shrink-0", config.textColor)} />
                                  <span className="font-medium truncate">{ag.client?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 text-xs text-muted-foreground">
                                  <span>{(formatDateOnlyToBR(ag.collectionDate) ?? "").slice(0, 10)}</span>
                                  <span>{ag.collectionTime}</span>
                                  <Badge variant="outline" className="text-xs">{ag.qtyBoxes} caixa(s)</Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{ag.user?.name}</p>
                            </Card>
                          );
                        })}
                      {agendamentosDoPeriodo.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">Nenhum agendamento neste período</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : selectedAgendamento ? (
              (() => {
                const ag = selectedAgendamento;
                return (
                  <>
                    {/* Header - Detalhes do Agendamento */}
                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border p-6 z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-foreground mb-2">
                            {ag.client.name}
                          </h2>
                          <Badge
                            className={
                              getStatusConfig(ag.status).bgLight
                            }
                          >
                            <span
                              className={
                                getStatusConfig(ag.status).textColor
                              }
                            >
                              {getStatusConfig(ag.status).label}
                            </span>
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedAgendamento(null); setIsSidePanelOpen(false); }}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Data e Hora */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {((): string => {
                              const s = (
                                ag.collectionDate ?? ""
                              ).slice(0, 10);
                              return s.length >= 10
                                ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`
                                : "--";
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{ag.collectionTime}</span>
                        </div>
                      </div>

                    </div>

                    {/* Editar Agendamento */}
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        carregarClientes();
                        if (open && ag) {
                          fillEditFormFromSelected();
                        }
                        if (!open) {
                          resetForm();
                          setIsPeriodic(false);
                          setQtdCaixasPorDia([]);
                          setQtdCaixasPorPeriodo([]);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <div className="w-[90%] mx-auto flex items-center justify-center p-6 space-y-6">
                          <Button
                            variant="outline"
                            className="w-full"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg mx-2 sm:mx-4">
                        <DialogHeader>
                          <DialogTitle>Editar Agendamento</DialogTitle>
                          <DialogDescription>
                            Edite os dados do agendamento no sistema
                          </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={(e) => handleEditAgendamento(e, ag)} className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="editClientId">Cliente *</Label>
                            <Select
                              value={formData.clientId}
                              disabled={!clientesAtivos.length}
                              onValueChange={(value) =>
                                setFormData({ ...formData, clientId: value })
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clientesAtivos.map((cliente) => (
                                  <SelectItem key={cliente.id} value={cliente.id}>
                                    {cliente.usaNome} -{" "}
                                    {cliente.usaAddress.cidade as string},{" "}
                                    {cliente.usaAddress.estado as string}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {!clientesAtivos.length && (
                            <EmptyStateAlert
                              title="Nenhum cliente ativo"
                              description="Não há clientes ativos para agendamento. Cadastre um cliente ou ative um existente. O campo Cliente ficará desabilitado até que exista ao menos um cliente ativo."
                            />
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="editCollectionDate">Data da Coleta {formData.isPeriodic ? '' : '*'}</Label>
                              <Input
                                type="date"
                                id="editCollectionDate"
                                min={minCollectionDateByPeriod ?? dataPickerBlocked()}
                                max={maxCollectionDateByPeriod}
                                value={formData.collectionDate}
                                required={!formData.isPeriodic}
                                onLoad={() => {
                                  if (formData.collectionDate) {
                                    carregarQtdCaixasPorDia(formData.collectionDate, formData.isPeriodic, formData.appointmentPeriodId);
                                  } else {
                                    setQtdCaixasPorDia([]);
                                  }
                                }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData({ ...formData, collectionDate: value });
                                  if (value) {
                                    carregarQtdCaixasPorDia(value, formData.isPeriodic, formData.appointmentPeriodId);
                                  } else {
                                    setQtdCaixasPorDia([]);
                                  }
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="editCollectionTime">Horário Previsto</Label>
                              <Input
                                id="editCollectionTime"
                                type="time"
                                value={formData.collectionTime}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    collectionTime: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <AppointmentBoxesPerDayAlert
                            qtdCaixasPorDia={qtdCaixasPorDia}
                            collectionDate={formData.collectionDate}
                            qtyAllowed={13}
                          />

                          <div className="rounded-xl border border-slate-200 bg-slate-50/95 dark:bg-slate-900/70 dark:border-slate-700 px-4 py-4 mt-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] space-y-5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="isPeriodic"
                                  className="text-xs font-semibold text-slate-900 dark:text-slate-50"
                                >
                                  Período de Coleta
                                </Label>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Ative para definir um intervalo de datas recorrentes para este agendamento.
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {formData.isPeriodic ? "Ativado" : "Desativado"}
                                </span>
                                <Switch
                                  id="isPeriodic"
                                  checked={formData.isPeriodic}
                                  onCheckedChange={(checked) => {
                                    setIsPeriodic(checked);
                                    carregarQtdCaixasPorDia(formData.collectionDate, checked, checked ? formData.appointmentPeriodId : "");
                                    carregarPeriodos();
                                    setFormData((prev) => ({
                                      ...prev,
                                      isPeriodic: checked,
                                      ...(checked ? {} : { appointmentPeriodId: "" }),
                                    }));
                                    if (!checked) setQtdCaixasPorPeriodo([]);
                                  }}
                                />
                              </div>
                            </div>

                            {formData.isPeriodic && (
                              periodos.length > 0 ? (
                                <AnimatePresence>
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="pt-2"
                                  >
                                    <div className="grid grid-cols-1 gap-3">
                                      <div className="space-y-2">
                                        <Label htmlFor="appointmentPeriodId">Selecione o Período de Coleta *</Label>
                                        <Select
                                          value={formData.appointmentPeriodId}
                                          onValueChange={(value) => {
                                            setFormData((prev) => {
                                              const period = periodos.find((p) => String(p.id ?? "") === String(value));
                                              if (period?.startDate != null && period?.endDate != null) {
                                                const startStr =
                                                  typeof period.startDate === "string"
                                                    ? period.startDate.slice(0, 10)
                                                    : new Date(period.startDate).toISOString().slice(0, 10);
                                                const endStr =
                                                  typeof period.endDate === "string"
                                                    ? period.endDate.slice(0, 10)
                                                    : new Date(period.endDate).toISOString().slice(0, 10);
                                                carregarQtdCaixasPorDia(prev.collectionDate, prev.isPeriodic, value);
                                                carregarQtdCaixasPorPeriodo(startStr, endStr);
                                              } else {
                                                setQtdCaixasPorPeriodo([]);
                                              }
                                              return { ...prev, appointmentPeriodId: value };
                                            });
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione o período de coleta" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {periodos.map((period) => (
                                              <SelectItem key={period.id ?? ""} value={period.id ?? ""}>
                                                {period.title} - ({period.collectionArea}) : {formatDateOnlyToBR(toDateOnly(String(period.startDate)))} – {formatDateOnlyToBR(toDateOnly(String(period.endDate)))}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </motion.div>
                                </AnimatePresence>
                              ) : (
                                <div className="pt-2">
                                  <EmptyStateAlert
                                    title="Nenhum período de coleta encontrado"
                                    description="Cadastre um período de coleta para poder usar esta opção no agendamento."
                                  />
                                </div>
                              )
                            )}
                          </div>

                          {formData.isPeriodic && periodos.length > 0 && formData.appointmentPeriodId && (
                            <AppointmentBoxesPerPeriodAlert items={qtdCaixasPorPeriodo} />
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="value">Valor Total *</Label>
                              <Input
                                id="value"
                                type="number"
                                required
                                min={1}
                                value={formData.value}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    value: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="downPayment">Valor do Pagamento Antecipado</Label>
                              <Input
                                id="downPayment"
                                type="number"
                                min={0.00}
                                value={formData.downPayment}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    downPayment: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editQtyBoxes">Quantidade de caixas *</Label>
                            <Input
                              id="editQtyBoxes"
                              type="number"
                              required
                              min={1}
                              value={formData.qtyBoxes}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  qtyBoxes: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <AtendenteSelect
                            user={user ? { id: user.id, nome: user.nome } : null}
                            value={formData.userId}
                            onValueChange={(id) =>
                              setFormData({ ...formData, userId: id })
                            }
                            label="Atendente *"
                            required
                          />

                          {/* Editar Status */}
                          <div className="space-y-2">
                            <Label htmlFor="editStatus">Status *</Label>
                            <Select
                              required
                              value={formData.status || undefined}
                              onValueChange={(value) => {
                                setFormData({
                                  ...formData,
                                  status: value as Agendamento["status"],
                                });
                              }}
                            >
                              <SelectTrigger id="editStatus" required aria-required>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pendente</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                                <SelectItem value="COLLECTED">Coletado</SelectItem>
                                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editObservations">Observações</Label>
                            <Textarea
                              id="editObservations"
                              value={formData.observations}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  observations: e.target.value,
                                })
                              }
                              placeholder="Informações adicionais..."
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                resetForm();
                                setIsPeriodic(false);
                                setQtdCaixasPorDia([]);
                                setQtdCaixasPorPeriodo([]);
                                setIsEditDialogOpen(false);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit">Salvar Alterações</Button>
                          </div>

                        </form>

                      </DialogContent>
                    </Dialog>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* Endereço */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Endereço de Coleta
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {ag.address}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ag.address)}`,
                              "_blank",
                            )
                          }
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Abrir no Google Maps
                        </Button>
                      </div>

                      {/* Atendente Responsável */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Atendente Responsável
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {ag.user?.name}
                        </p>
                      </div>

                      {/* Observações */}
                      {ag.observations && (
                        <div>
                          <h3 className="font-semibold mb-2">Observações</h3>
                          <p className="text-sm text-muted-foreground italic">
                            {ag.observations}
                          </p>
                        </div>
                      )}

                      {/* Quantidade de Caixas */}
                      <div>
                        <h3 className="font-semibold mb-2">Quantidade de Caixas</h3>
                        <p className="text-sm text-muted-foreground">
                          {ag.qtyBoxes} {"Caixa(s)"}
                        </p>
                      </div>

                      {/* Alterar Status */}
                      <div>
                        <h3 className="font-semibold mb-2">Alterar Status</h3>
                        <Select
                          value={ag.status}
                          onValueChange={(value) => {
                            handleStatusChange(
                              ag.id!,
                              value as Agendamento["status"],
                            );
                            setSelectedAgendamento({
                              ...ag,
                              status: value as Agendamento["status"],
                              collectionTime: ag.collectionTime ?? "",
                            });
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "border-l-4 font-medium transition-colors",
                              ag.status === "PENDING" &&
                              "border-l-[var(--accent)] bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20",
                              ag.status === "CONFIRMED" &&
                              "border-l-green-600 bg-green-50 dark:bg-green-950/30 dark:border-l-green-500",
                              ag.status === "COLLECTED" &&
                              "border-l-[var(--secondary)] bg-[var(--secondary)]/10 dark:bg-[var(--secondary)]/20",
                              ag.status === "CANCELLED" &&
                              "border-l-[var(--destructive)] bg-[var(--destructive)]/10 dark:bg-[var(--destructive)]/20"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="PENDING"
                              className="focus:bg-[var(--accent)]/15 focus:text-[var(--accent)] data-[highlighted]:bg-[var(--accent)]/15 text-[var(--accent)] dark:focus:bg-[var(--accent)]/25 dark:data-[highlighted]:bg-[var(--accent)]/25"
                            >
                              <span className="mr-2 inline-block size-2 rounded-full bg-[var(--accent)]" />
                              Pendente
                            </SelectItem>
                            <SelectItem
                              value="CONFIRMED"
                              className="focus:bg-green-50 focus:text-green-700 data-[highlighted]:bg-green-50 text-green-700 dark:focus:bg-green-950/50 dark:data-[highlighted]:bg-green-950/50 dark:text-green-400"
                            >
                              <span className="mr-2 inline-block size-2 rounded-full bg-green-500" />
                              Confirmado
                            </SelectItem>
                            <SelectItem
                              value="COLLECTED"
                              className="focus:bg-[var(--secondary)]/15 focus:text-[var(--secondary)] data-[highlighted]:bg-[var(--secondary)]/15 text-[var(--secondary)] dark:focus:bg-[var(--secondary)]/25 dark:data-[highlighted]:bg-[var(--secondary)]/25"
                            >
                              <span className="mr-2 inline-block size-2 rounded-full bg-[var(--secondary)]" />
                              Coletado
                            </SelectItem>
                            <SelectItem
                              value="CANCELLED"
                              className="focus:bg-[var(--destructive)]/15 focus:text-[var(--destructive)] data-[highlighted]:bg-[var(--destructive)]/15 text-[var(--destructive)] dark:focus:bg-[var(--destructive)]/25 dark:data-[highlighted]:bg-[var(--destructive)]/25"
                            >
                              <span className="mr-2 inline-block size-2 rounded-full bg-[var(--destructive)]" />
                              Cancelado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ações */}
                      <div className="space-y-2 pt-4 border-t">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() =>
                            handleDelete(
                              ag.id!,
                              ag.client.name,
                            )
                          }
                        >
                          Excluir Agendamento
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
