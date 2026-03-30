import React from "react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import { useData } from "../context/DataContext";
import { Appointment, Client } from "../api";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Search,
  LayoutGrid,
  List,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { connectSocket, getSocket } from "../api";
import type {
  CreateAppointmentsPeriodsDTO,
  UpdateAppointmentsPeriodsDTO,
} from "../api";
import { toDateOnly, formatDateOnlyToBR } from "../utils";
import {
  getStatusConfig,
  getStatusKey,
  PERIODOS_CARD_PAGE_SIZE,
  PERIODOS_SELECT_LIMIT,
  statusConfig,
  ViewMode,
} from './appointments/index';
import { parseLocalDate, toYYYYMMDD } from './appointments/index';
import { appointmentsCrud, clientsCrud } from './appointments/index';
import { useAppointmentsForms } from './appointments/hooks/useAppointmentsForms';
import { useAppointmentsDateGetters } from './appointments/hooks/useAppointmentsDateGetters';
import {
  handleDeleteAgendamento,
  handleEditAgendamento as runEditAgendamento,
  handleEditCollectionPeriod,
  handleAgendamentoStatusChange,
  handleCreateAgendamento,
  handleCreatePeriod,
} from './appointments/appointments.handlers';
import {
  AppointmentsContentView,
  AppointmentsCalendarLegend,
  AppointmentsDialogs,
  AppointmentsFiltersPanel,
  AppointmentsEditPeriodDialog,
  AppointmentsMetricsCards,
  AppointmentsPeriodSidePanelContent,
  AppointmentsSelectedAppointmentContent,
  AppointmentsSidePanel,
} from './appointments/index';
import { AppointmentsCreatePeriodForm } from "./appointments/components/AppointmentsCreatePeriodForm";
import { AppointmentsCreateAppointmentForm } from "./appointments/components/AppointmentsCreateAppointmentForm";

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
  const [listVisibleCount, setListVisibleCount] = useState(40);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isPeriodic, setIsPeriodic] = useState<boolean>(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Appointment | null>(null);
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Client[]>([]);
  const [qtdCaixasPorDia, setQtdCaixasPorDia] = useState<
    { collectionDate: string; qtyBoxes: number }[]
  >([]);

  const [qtdCaixasPorPeriodo, setQtdCaixasPorPeriodo] = useState<
    { collectionDate: string; qtyBoxes: number }[]
  >([]);
  const [semDiaColetaNoPeriodo, setSemDiaColetaNoPeriodo] = useState(0);

  const clientesAtivos = useMemo(
    () => clientes.filter((c) => c.status === "ACTIVE"),
    [clientes]
  );

  /** Períodos para selects / validações (até 200 itens). */
  const [periodos, setPeriodos] = useState<CreateAppointmentsPeriodsDTO[]>([]);
  /** Lista paginada do card “Períodos de Coleta”. */
  const [periodosLista, setPeriodosLista] = useState<CreateAppointmentsPeriodsDTO[]>([]);
  const [periodosListPagination, setPeriodosListPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);
  const [loadingPeriodosLista, setLoadingPeriodosLista] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState<CreateAppointmentsPeriodsDTO | null>(null);
  /** Dia opcional no período: quando null, mostra todos os dias do período; quando definido, filtra por esse dia. */
  const [selectedDayInPeriod, setSelectedDayInPeriod] = useState<Date | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [confirmEditPeriodOpen, setConfirmEditPeriodOpen] = useState(false);
  const pendingEditPeriodPayloadRef = useRef<UpdateAppointmentsPeriodsDTO | null>(null);

  const carregarAgendamentos = useCallback(async () => {
    const result = await appointmentsCrud.getAll();
    if (result.success && result.data) {
      setAgendamentos(result.data);
    }
  }, [setAgendamentos]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  const carregarPeriodosOpcoes = useCallback(async () => {
    const result = await appointmentsCrud.getAllPeriods(1, PERIODOS_SELECT_LIMIT);
    if (result.success && result.data) setPeriodos(result.data);
  }, []);

  const carregarPeriodosLista = useCallback(async (page: number) => {
    setLoadingPeriodosLista(true);
    try {
      const result = await appointmentsCrud.getAllPeriods(page, PERIODOS_CARD_PAGE_SIZE);
      if (result.success && result.data) {
        setPeriodosLista(result.data);
        setPeriodosListPagination(result.pagination ?? null);
      }
    } finally {
      setLoadingPeriodosLista(false);
    }
  }, []);

  useEffect(() => {
    carregarPeriodosOpcoes();
    void carregarPeriodosLista(1);
  }, [carregarPeriodosOpcoes, carregarPeriodosLista]);

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
    const result = await appointmentsCrud.getAllQtdBoxesPerDay(collectionDateISO, isPeriodic, appointmentPeriodId);
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
      setSemDiaColetaNoPeriodo(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return;
    const startDateISO = toDateOnly(startDate) || start.toISOString().slice(0, 10);
    const endDateISO = toDateOnly(endDate) || end.toISOString().slice(0, 10);

    const result = await appointmentsCrud.getAllQtdBoxesPerPeriod(startDateISO, endDateISO);
    if (result.success && result.data !== undefined) {
      setQtdCaixasPorPeriodo([...(result.data as { collectionDate: string; qtyBoxes: number }[])]);
      setSemDiaColetaNoPeriodo(
        Math.max(0, Number(result.semDiaColetaNoPeriodo ?? 0) || 0),
      );
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const {
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
  } = useAppointmentsForms({
    selectedAgendamento,
    selectedPeriod,
    setQtdCaixasPorDia,
    setQtdCaixasPorPeriodo,
    setSemDiaColetaNoPeriodo,
    carregarQtdCaixasPorDia,
    carregarPeriodosOpcoes,
  });

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

  const handleSubmit = async (e: React.FormEvent) =>
    handleCreateAgendamento({
      e,
      clientes,
      formData,
      periodos,
      create: appointmentsCrud.create,
      addAgendamento,
      resetForm,
      resetFormPeriod,
      setIsPeriodic,
      setIsDialogOpen,
    });

  const handleEditAgendamento = async (e: React.FormEvent, agendamento: Appointment) =>
    runEditAgendamento({
      e,
      agendamento,
      clientes,
      formData,
      periodos,
      selectedAgendamento,
      update: appointmentsCrud.update,
      updateAgendamento,
      setSelectedAgendamento,
      setIsEditDialogOpen,
      resetEditForm,
      resetForm,
      resetFormPeriod,
      setIsPeriodic,
      carregarAgendamentos,
    });

  const handleStatusChange = async (id: string, status: Appointment["status"]) =>
    handleAgendamentoStatusChange({
      id,
      status,
      update: appointmentsCrud.update,
      updateAgendamento,
      setSelectedAgendamento,
      carregarAgendamentos,
    });

  const handleDelete = async (id: string, clientName: string) =>
    handleDeleteAgendamento({
      id,
      clientName,
      remove: appointmentsCrud.delete,
      deleteAgendamento,
      setSelectedAgendamento,
      carregarAgendamentos,
    });

  const handleCreatePeriodic = async (e: React.FormEvent) =>
    handleCreatePeriod({
      e,
      formDataPeriod,
      createPeriod: appointmentsCrud.createPeriod,
      resetFormPeriod,
      setIsCreatePeriodicOpen,
      carregarPeriodosOpcoes,
      carregarPeriodosLista,
    });

  const handleEditPeriod = async (e?: React.FormEvent, confirmed?: boolean) =>
    handleEditCollectionPeriod({
      e,
      confirmed,
      selectedPeriod,
      formDataPeriod,
      pendingEditPeriodPayloadRef,
      setConfirmEditPeriodOpen,
      updatePeriod: appointmentsCrud.updatePeriod,
      setIsDialogEditPeriodOpen,
      resetFormPeriod,
      carregarPeriodosOpcoes,
      carregarPeriodosLista,
      periodosListCurrentPage: periodosListPagination?.page ?? 1,
      carregarAgendamentos,
      setSelectedPeriod,
    });

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
    const result = await clientsCrud.getAll();
    if (result.success && result.data) {
      setClientes(result.data);
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
        agendamento.client.usaAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const sortedFilteredAgendamentos = useMemo(
    () =>
      filteredAgendamentos.slice().sort((a, b) => {
        const dateCompare = (a.collectionDate ?? "").localeCompare(
          b.collectionDate ?? "",
        );
        if (dateCompare !== 0) return dateCompare;
        return a.collectionTime.localeCompare(b.collectionTime);
      }),
    [filteredAgendamentos],
  );

  const renderedAgendamentosList = useMemo(
    () => sortedFilteredAgendamentos.slice(0, listVisibleCount),
    [sortedFilteredAgendamentos, listVisibleCount],
  );

  useEffect(() => {
    setListVisibleCount(40);
    if (listContainerRef.current) listContainerRef.current.scrollTop = 0;
  }, [searchTerm, filters, viewMode, selectedDate, selectedPeriod?.id, selectedDayInPeriod]);

  const agendamentosDosDia = useMemo(() => {
    return filteredAgendamentos.filter((ag) =>
      isSameDay(
        new Date((ag.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
        selectedDate,
      ),
    );
  }, [filteredAgendamentos, selectedDate]);

  /**
   * Agendamentos **periódicos** do período selecionado. Únicos (!isPeriodic) não entram na visão do período,
   * mesmo com o mesmo appointmentPeriodId — não são coletas do período.
   */
  const agendamentosDoPeriodo = useMemo(() => {
    if (!selectedPeriod?.id) return [];
    return agendamentos.filter((agendamento) => {
      if ((agendamento.appointmentPeriodId ?? "") !== selectedPeriod.id) return false;
      if (!agendamento.isPeriodic) return false;
      const matchesSearch =
        agendamento.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.client.usaAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const {
    getDateLabel,
    getDatesWithAgendamentos,
    getDatesWithGrupoEUnico,
    getDatesUnicoDentroDePeriodo,
    getDatesInPeriodRangeOnlyNoHalfHalf,
    getDatesWithAppointmentsInPeriodNoHalfHalf,
    getDatesHojeComAgendamentoHalf,
  } = useAppointmentsDateGetters({
    agendamentos,
    filteredAgendamentos,
    selectedPeriod,
  });



  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
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
          <AppointmentsDialogs
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            confirmEditPeriodOpen={confirmEditPeriodOpen}
            setConfirmEditPeriodOpen={setConfirmEditPeriodOpen}
            onConfirmEditPeriod={() => handleEditPeriod(undefined, true)}
            isCreatePeriodicOpen={isCreatePeriodicOpen}
            setIsCreatePeriodicOpen={setIsCreatePeriodicOpen}
            onOpenCreatePeriod={resetFormPeriod}
            onCloseCreatePeriod={resetFormPeriod}
            createPeriodContent={
              <AppointmentsCreatePeriodForm
                formDataPeriod={formDataPeriod}
                setFormDataPeriod={setFormDataPeriod}
                handleCreatePeriodic={handleCreatePeriodic}
                dataPickerBlocked={dataPickerBlocked}
                resetFormPeriod={resetFormPeriod}
                setIsCreatePeriodicOpen={setIsCreatePeriodicOpen}
              />
            }
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            onOpenCreateAppointment={() => {
              carregarClientes();
              resetForm();
            }}
            onCloseCreateAppointment={() => {
              resetForm();
              resetEditForm();
              setQtdCaixasPorDia([]);
              setQtdCaixasPorPeriodo([]);
              setSemDiaColetaNoPeriodo(0);
              setIsPeriodic(false);
            }}
            createAppointmentContent={
              <AppointmentsCreateAppointmentForm
                formData={formData}
                setFormData={setFormData}
                clientesAtivos={clientesAtivos}
                minCollectionDateByPeriod={minCollectionDateByPeriod}
                maxCollectionDateByPeriod={maxCollectionDateByPeriod}
                dataPickerBlocked={dataPickerBlocked}
                carregarQtdCaixasPorDia={carregarQtdCaixasPorDia}
                setQtdCaixasPorDia={setQtdCaixasPorDia}
                qtdCaixasPorDia={qtdCaixasPorDia}
                periodos={periodos}
                carregarPeriodosOpcoes={carregarPeriodosOpcoes}
                setIsPeriodic={setIsPeriodic}
                setQtdCaixasPorPeriodo={setQtdCaixasPorPeriodo}
                setSemDiaColetaNoPeriodo={setSemDiaColetaNoPeriodo}
                carregarQtdCaixasPorPeriodo={carregarQtdCaixasPorPeriodo}
                qtdCaixasPorPeriodo={qtdCaixasPorPeriodo}
                semDiaColetaNoPeriodo={semDiaColetaNoPeriodo}
                user={user ? { id: user.id, nome: user.nome } : null}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
                resetEditForm={resetEditForm}
                setIsDialogOpen={setIsDialogOpen}
              />
            }
          />
        </div>

        <AppointmentsMetricsCards statistics={statistics} />

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

        <AppointmentsCalendarLegend />

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
            {loadingPeriodosLista ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <p className="text-sm">Carregando períodos…</p>
              </div>
            ) : periodosListPagination && periodosListPagination.total === 0 ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <p className="text-sm">Nenhum registro de período de coleta encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periodosLista.map((periodo) => {
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
                            <AppointmentsEditPeriodDialog
                              periodo={periodo}
                              isDialogEditPeriodOpen={isDialogEditPeriodOpen}
                              selectedPeriodId={selectedPeriod?.id}
                              setSelectedPeriod={setSelectedPeriod}
                              fillEditFormPeriodFrom={fillEditFormPeriodFrom}
                              resetFormPeriod={resetFormPeriod}
                              setIsDialogEditPeriodOpen={setIsDialogEditPeriodOpen}
                              formDataPeriod={formDataPeriod}
                              setFormDataPeriod={setFormDataPeriod}
                              dataPickerBlocked={dataPickerBlocked}
                              handleEditPeriod={handleEditPeriod}
                            />
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
                        {periodo.status && (
                          <div className="flex justify-end w-fit float-right">
                            <Badge className={getStatusConfig(periodo.status).bgLight} variant="secondary">
                              <span className={getStatusConfig(periodo.status).textColor}>
                                {getStatusConfig(periodo.status).label}
                              </span>
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {periodosListPagination && periodosListPagination.totalPages > 1 && (
                  <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Página {periodosListPagination.page} de {periodosListPagination.totalPages}
                      {periodosListPagination.total > 0 && (
                        <> · {periodosListPagination.total} período(s)</>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!periodosListPagination.hasPreviousPage}
                        onClick={() =>
                          void carregarPeriodosLista(periodosListPagination.page - 1)
                        }
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!periodosListPagination.hasNextPage}
                        onClick={() =>
                          void carregarPeriodosLista(periodosListPagination.page + 1)
                        }
                      >
                        Próxima
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <AppointmentsFiltersPanel
          showFilters={showFilters}
          filters={filters}
          setFilters={setFilters}
          filteredCount={filteredAgendamentos.length}
          statusConfig={statusConfig}
        />
      </div>

      <AppointmentsContentView
        viewMode={viewMode}
        selectedPeriod={selectedPeriod}
        selectedDayInPeriod={selectedDayInPeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setSelectedDayInPeriod={setSelectedDayInPeriod}
        getDateLabel={getDateLabel}
        getDatesWithAgendamentos={getDatesWithAgendamentos}
        getDatesWithGrupoEUnico={getDatesWithGrupoEUnico}
        getDatesUnicoDentroDePeriodo={getDatesUnicoDentroDePeriodo}
        getDatesInPeriodRangeOnlyNoHalfHalf={getDatesInPeriodRangeOnlyNoHalfHalf}
        getDatesWithAppointmentsInPeriodNoHalfHalf={getDatesWithAppointmentsInPeriodNoHalfHalf}
        getDatesHojeComAgendamentoHalf={getDatesHojeComAgendamentoHalf}
        agendamentosDoPeriodoNoDia={agendamentosDoPeriodoNoDia}
        agendamentosDoPeriodo={agendamentosDoPeriodo}
        agendamentosDosDia={agendamentosDosDia}
        somaCaixasDoPeriodoNoDia={somaCaixasDoPeriodoNoDia}
        somaCaixasDosDia={somaCaixasDosDia}
        setSelectedAgendamento={setSelectedAgendamento}
        setIsSidePanelOpen={setIsSidePanelOpen}
        getStatusConfig={getStatusConfig}
        filteredAgendamentos={filteredAgendamentos}
        renderedAgendamentosList={renderedAgendamentosList}
        sortedFilteredAgendamentos={sortedFilteredAgendamentos}
        listContainerRef={listContainerRef}
        listVisibleCount={listVisibleCount}
        setListVisibleCount={setListVisibleCount}
        getStatusKey={getStatusKey}
      />

      {/* Painel Lateral - Período (resumo agregado) ou Detalhes do Agendamento */}
      <AppointmentsSidePanel
        isOpen={isSidePanelOpen}
        hasContent={Boolean(selectedPeriod || selectedAgendamento)}
      >
        {selectedPeriod ? (
          <AppointmentsPeriodSidePanelContent
            selectedPeriod={selectedPeriod}
            agendamentosDoPeriodo={agendamentosDoPeriodo}
            getStatusConfig={getStatusConfig}
            onClose={() => {
              setSelectedPeriod(null);
              setIsSidePanelOpen(false);
            }}
            onSelectAgendamento={(ag) => {
              setSelectedPeriod(null);
              setSelectedAgendamento(ag);
            }}
          />
        ) : selectedAgendamento ? (
          (() => {
            const ag = selectedAgendamento;
            return (
              <AppointmentsSelectedAppointmentContent
                ag={ag}
                getStatusConfig={getStatusConfig}
                onClose={() => {
                  setSelectedAgendamento(null);
                  setIsSidePanelOpen(false);
                }}
                onDelete={handleDelete}
                onStatusChange={(id, value) =>
                  void handleStatusChange(id, value as Appointment["status"])
                }
                onSelectedAgendamentoChange={setSelectedAgendamento}
                editDialogProps={{
                  ag,
                  isEditDialogOpen,
                  setIsEditDialogOpen,
                  carregarClientes,
                  fillEditFormFromSelected,
                  resetForm,
                  setIsPeriodic,
                  setQtdCaixasPorDia,
                  setQtdCaixasPorPeriodo,
                  setSemDiaColetaNoPeriodo,
                  handleEditAgendamento,
                  formData,
                  setFormData,
                  clientesAtivos,
                  minCollectionDateByPeriod,
                  maxCollectionDateByPeriod,
                  dataPickerBlocked,
                  carregarQtdCaixasPorDia,
                  qtdCaixasPorDia,
                  periodos,
                  carregarPeriodosOpcoes,
                  carregarQtdCaixasPorPeriodo,
                  qtdCaixasPorPeriodo,
                  semDiaColetaNoPeriodo,
                  user: user ? { id: user.id, nome: user.nome } : null,
                }}
              />
            );
          })()
        ) : null}
      </AppointmentsSidePanel>
    </div >
  );
}
