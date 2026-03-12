import { useState, useMemo, useEffect, useCallback } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
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
import { appointmentsService, CreateAppointmentsDTO, UpdateAppointmentsDTO } from "../services/appointments.service";
import { connectSocket, getSocket } from "../services/socket.service";

type ViewMode = "calendar" | "list" | "timeline";

export default function AgendamentosView() {
  const {
    agendamentos,
    setAgendamentos,
    addAgendamento,
    updateAgendamento,
    deleteAgendamento,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    { startDate: string; endDate: string; qtyBoxes: number }[]
  >([]);

  const clientesAtivos = useMemo(
    () => clientes.filter((c) => c.status === "ACTIVE"),
    [clientes]
  );

  const carregarAgendamentos = useCallback(async () => {
    const result = await appointmentsService.getAll();
    if (result.success && result.data) {
      setAgendamentos(result.data);
    }
  }, [setAgendamentos]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

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

  const carregarQtdCaixasPorDia = async (date: string) => {
    if (!date?.trim()) {
      setQtdCaixasPorDia([]);
      return;
    };

    const dateISO = new Date(date).toISOString() ?? "";
    const result = await appointmentsService.getAllQtdBoxesPerDay(dateISO);
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
    const startDateISO = start.toISOString().slice(0, 10);
    const endDateISO = end.toISOString().slice(0, 10);

    const result = await appointmentsService.getAllQtdBoxesPerPeriod(startDateISO, endDateISO);
    if (result.success && result.data !== undefined) {
      const raw = result.data as any;
      // TODO - trocar qtyBoxes por qtyBoxesPeriod vindo do backend
      const list: { startDate: string; endDate: string; qtyBoxes: number }[] =
        Array.isArray(raw)
          ? raw
          : raw?.data != null
            ? Array.isArray(raw.data)
              ? raw.data
              : [raw.data]
            : typeof raw === "object" &&
              raw !== null &&
              ("qtyBoxes" in raw || "startDate" in raw && "endDate" in raw)
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
    startDate: "",
    endDate: "",
    qtyBoxes: 0,
    observations: "",
    userId: "",
    status: "",
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      collectionDate: "",
      collectionTime: "",
      value: 0,
      downPayment: 0,
      isPeriodic: false,
      startDate: "",
      endDate: "",
      qtyBoxes: 0,
      observations: "",
      userId: "",
      status: "",
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
      startDate: selectedAgendamento?.startDate ?? "",
      endDate: selectedAgendamento?.endDate ?? "",
      qtyBoxes: selectedAgendamento?.qtyBoxes ?? 0,
      observations: selectedAgendamento?.observations ?? "",
      userId: selectedAgendamento?.user.id ?? "",
      status: selectedAgendamento?.status ?? "",
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
      startDate: selectedAgendamento?.startDate ?? "",
      endDate: selectedAgendamento?.endDate ?? "",
      qtyBoxes: selectedAgendamento.qtyBoxes ?? 0,
      observations: selectedAgendamento.observations ?? "",
      userId: selectedAgendamento.user?.id ?? "",
      status: selectedAgendamento.status ?? "",
    });
    carregarQtdCaixasPorDia(collectionDate || new Date().toISOString().slice(0, 10));
    carregarQtdCaixasPorPeriodo(selectedAgendamento?.startDate ?? "", selectedAgendamento?.endDate ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cliente = clientes.find((c) => c.id === formData.clientId);
    if (!cliente) {
      toast.error("Nenhum cliente selecionado");
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

    const rawDate = (formData.collectionDate ?? "").trim();
    if (!rawDate) {
      toast.error("Informe a data de coleta.");
      return;
    }

    const collectionDateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : (() => {
        const d = new Date(rawDate);
        if (Number.isNaN(d.getTime())) {
          return null;
        }
        return d.toISOString().split("T")[0];
      })();
    if (!collectionDateStr) {
      toast.error("Data de coleta inválida.");
      return;
    }

    if (formData.isPeriodic && (formData.collectionDate < formData.startDate || formData.collectionTime > formData.endDate)) {
      toast.error("A data de coleta não está dentro do intervalo de datas.");
      return;
    }

    const address = `${cliente.usaAddress.rua}, ${cliente.usaAddress.numero}, ${cliente.usaAddress.cidade}, ${cliente.usaAddress.estado} ${cliente.usaAddress.zipCode}`;

    const payload = {
      clientId: formData.clientId,
      userId: formData.userId,
      collectionDate: collectionDateStr,
      collectionTime: formData.collectionTime ?? "",
      value: formData?.value ?? 0,
      downPayment: formData?.downPayment ?? 0,
      isPeriodic: formData?.isPeriodic ?? false,
      startDate: formData?.startDate ?? "",
      endDate: formData?.endDate ?? "",
      qtyBoxes: qty,
      address,
      status: formData.status as
        | "PENDING"
        | "CONFIRMED"
        | "COLLECTED"
        | "CANCELLED",
      ...(formData.observations != null && formData.observations !== ""
        ? { observations: formData.observations }
        : {}),
    };

    const result = await appointmentsService.create(payload);

    if (!result.success || !result.data) {
      toast.error(result.error ?? "Erro ao criar agendamento.");
      return;
    }

    addAgendamento(result.data);
    resetForm();
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

    const rawDate = (formData.collectionDate ?? "").trim();
    if (!rawDate) {
      toast.error("Informe a data de coleta.");
      return;
    }

    const collectionDateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : (() => {
        const d = new Date(rawDate);
        if (Number.isNaN(d.getTime())) {
          return null;
        }
        return d.toISOString().split("T")[0];
      })();
    if (!collectionDateStr) {
      toast.error("Data de coleta inválida.");
      return;
    }

    const getUpdatePayload = (): UpdateAppointmentsDTO => {
      const current: UpdateAppointmentsDTO = {
        clientId: formData.clientId,
        userId: formData.userId,
        collectionDate: collectionDateStr,
        collectionTime: formData.collectionTime ?? "",
        value: formData?.value ?? 0,
        downPayment: formData?.downPayment ?? 0,
        isPeriodic: formData?.isPeriodic ?? false,
        startDate: formData?.startDate ?? "",
        endDate: formData?.endDate ?? "",
        qtyBoxes: qty,
        status: formData.status as
          | "PENDING"
          | "CONFIRMED"
          | "COLLECTED"
          | "CANCELLED",
        observations: formData.observations ?? "",
      }

      const original = selectedAgendamento!;
      const patch: UpdateAppointmentsDTO = {};

      if (current.clientId !== original.client.id) patch.clientId = current.clientId;
      if (current.userId !== original.user.id) patch.userId = current.userId;
      if (current.collectionDate !== original.collectionDate) patch.collectionDate = current.collectionDate;
      if (current.collectionTime !== original.collectionTime) patch.collectionTime = current.collectionTime;
      if (current.value !== original.value) patch.value = current.value;
      if (current.downPayment !== original.downPayment) patch.downPayment = current.downPayment;
      if (current.isPeriodic !== original.isPeriodic) patch.isPeriodic = current.isPeriodic;
      if (current.startDate !== original.startDate) patch.startDate = current.startDate;
      if (current.endDate !== original.endDate) patch.endDate = current.endDate;
      if (current.qtyBoxes !== original.qtyBoxes) patch.qtyBoxes = current.qtyBoxes;
      if (current.status !== original.status) patch.status = current.status;
      if (current.observations !== original.observations) patch.observations = current.observations;

      return patch;
    }

    const patchPayload = getUpdatePayload();

    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    if (formData.isPeriodic && (formData.collectionDate < formData.startDate || formData.collectionTime > formData.endDate)) {
      toast.error("A data de coleta não está dentro do intervalo de datas.");
      return;
    }

    const result = await appointmentsService.update(selectedAgendamento!.id!, patchPayload);
    if (result.success && result.data) {
      updateAgendamento(selectedAgendamento!.id!, result.data);
      setSelectedAgendamento(result.data);
      setIsEditDialogOpen(false);
      resetEditForm();
      setIsPeriodic(false);
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
      updateAgendamento(id, { status });
      setSelectedAgendamento(result.data);
      setSelectedAgendamento(null);
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
    const today = new Date().toISOString().split("T")[0];
    return today;
  };

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

  const getDatesWithAgendamentos = () => {
    return agendamentos.map(
      (a) => new Date((a.collectionDate ?? "").slice(0, 10) + "T12:00:00.000Z"),
    );
  };

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
                            onClick={() => setSelectedAgendamento(agendamento)}
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

            {/* Diálogo de Criação de Agendamento */}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                carregarClientes();
                if (!open) {
                  resetForm();
                  setClientes([]);
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

                  <div className="space-y-2 border-b pb-4 mb-4 pt-4">
                    <Label className="text-lg font-medium">Coleta Única</Label>
                    <p className="text-xs text-muted-foreground">
                      O agendamento será uma coleta única.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">Data da Coleta *</Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        min={formData.startDate ? formData.startDate : dataPickerBlocked()}
                        max={formData.endDate ? formData.endDate : ''}
                        value={formData.collectionDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            collectionDate: e.target.value,
                          });
                          carregarQtdCaixasPorDia(e.target.value);
                        }}
                        required
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

                  <div className="space-y-2 border-b pb-4 mb-4 pt-4">
                    <Label className="text-lg font-medium">Coleta Agrupada</Label>
                    <p className="text-xs text-muted-foreground">
                      O agendamento será uma coleta agrupada.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPeriodic">Período de Coleta</Label>
                      <p className="text-xs text-muted-foreground">
                        O agendamento terá um intervalo de datas se caso ativado.
                        <br />
                        <span className="text-xs text-muted-foreground">
                          Se o switch estiver desligado, o agendamento será uma coleta única.
                        </span>
                      </p>
                    </div>
                    <Switch
                      id="isPeriodic"
                      checked={formData.isPeriodic}
                      onCheckedChange={(checked) => {
                        setIsPeriodic(checked);
                        setFormData(({
                          ...formData,
                          isPeriodic: checked,
                          startDate: checked ? formData.startDate : '',
                          endDate: checked ? formData.endDate : '',
                        }));
                      }
                      }
                    />
                  </div>

                  {isPeriodic && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Data de Início</Label>
                            <Input
                              id="startDate"
                              type="date"
                              min={dataPickerBlocked()}
                              max={formData.endDate ? formData.endDate : ''}
                              value={formData.startDate}
                              onChange={(e) => {
                                setFormData({ ...formData, startDate: e.target.value, })
                                if (e.target.value && formData.endDate && e.target.value <= formData.endDate) {
                                  carregarQtdCaixasPorPeriodo(e.target.value, formData.endDate);
                                } else {
                                  setQtdCaixasPorPeriodo([]);
                                }

                              }
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">Data de Fim</Label>
                            <Input
                              id="endDate"
                              type="date"
                              min={formData.startDate ? formData.startDate : dataPickerBlocked()}
                              value={formData.endDate}
                              onChange={(e) => {
                                setFormData({ ...formData, endDate: e.target.value, })
                                if (e.target.value && formData.startDate && formData.startDate <= e.target.value) {
                                  carregarQtdCaixasPorPeriodo(formData.startDate, e.target.value);
                                } else {
                                  setQtdCaixasPorPeriodo([]);
                                }
                              }
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {isPeriodic && qtdCaixasPorPeriodo.length > 0 && (
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
                        setIsDialogOpen(false);
                        setIsPeriodic(false);

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
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                  className="rounded-md border"
                  modifiers={{
                    agendado: getDatesWithAgendamentos(),
                  }}
                  modifiersStyles={{
                    agendado: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      color: "#5DADE2",
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{getDateLabel(selectedDate)}</CardTitle>
                <CardDescription>
                  <span className="flex flex-col items-start gap-2 text-sm text-muted-foreground mt-2">
                    <span className="text-foreground">
                      {agendamentosDosDia.length} agendamento(s) programado(s)
                    </span>
                    <span className="font-bold text-foreground">
                      {somaCaixasDosDia} Caixa(s) do dia.
                    </span>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence>
                    {agendamentosDosDia
                      .sort((a, b) =>
                        a.collectionTime.localeCompare(b.collectionTime),
                      )
                      .map((agendamento) => {
                        const config = getStatusConfig(agendamento.status);
                        const StatusIcon = config.icon;

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
                              onClick={() => setSelectedAgendamento(agendamento)}
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
                                        <span className="font-semibold text-lg">
                                          {agendamento.collectionTime}
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

                  {agendamentosDosDia.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum agendamento para esta data</p>
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
                    const dateCompare = a.collectionDate.localeCompare(
                      b.collectionDate,
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
                          onClick={() => setSelectedAgendamento(agendamento)}
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
                                      {dateStr.length >= 10
                                        ? `${dateStr.slice(8, 10)}/${dateStr.slice(5, 7)}/${dateStr.slice(0, 4)}`
                                        : format(agDate, "dd/MM/yyyy")}
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

      {/* Painel Lateral - Detalhes do Agendamento */}
      <AnimatePresence>
        {selectedAgendamento && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[500px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {selectedAgendamento.client.name}
                  </h2>
                  <Badge
                    className={
                      getStatusConfig(selectedAgendamento.status).bgLight
                    }
                  >
                    <span
                      className={
                        getStatusConfig(selectedAgendamento.status).textColor
                      }
                    >
                      {getStatusConfig(selectedAgendamento.status).label}
                    </span>
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgendamento(null)}
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
                        selectedAgendamento.collectionDate ?? ""
                      ).slice(0, 10);
                      return s.length >= 10
                        ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`
                        : "--";
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{selectedAgendamento.collectionTime}</span>
                </div>
              </div>

            </div>

            {/* Editar Agendamento */}
            <Dialog
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                carregarClientes();
                if (open && selectedAgendamento) {
                  fillEditFormFromSelected();
                }
                if (!open) {
                  resetEditForm();
                  setIsPeriodic(false);
                  setClientes([]);
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

                <form onSubmit={(e) => handleEditAgendamento(e, selectedAgendamento)} className="space-y-6">
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

                  <div className="space-y-2 border-b pb-4 mb-4 pt-4">
                    <Label className="text-lg font-medium">Coleta Única</Label>
                    <p className="text-xs text-muted-foreground">
                      O agendamento será uma coleta única.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editCollectionDate">Data da Coleta *</Label>
                      <Input
                        type="date"
                        id="editCollectionDate"
                        min={dataPickerBlocked()}
                        value={formData.collectionDate}
                        onLoad={() => {
                          carregarQtdCaixasPorDia(formData.collectionDate);
                        }}
                        onChange={(e) => {
                          setFormData({ ...formData, collectionDate: e.target.value })
                          carregarQtdCaixasPorDia(e.target.value)
                        }
                        }
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

                  <div className="space-y-2 border-b pb-4 mb-4 pt-4">
                    <Label className="text-lg font-medium">Coleta Agrupada</Label>
                    <p className="text-xs text-muted-foreground">
                      O agendamento será uma coleta agrupada.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPeriodic">Período de Coleta</Label>
                      <p className="text-xs text-muted-foreground">
                        O agendamento terá um intervalo de datas se caso ativado.
                        <br />
                        <span className="text-xs text-muted-foreground">
                          Se o switch estiver desligado, o agendamento será uma coleta única.
                        </span>
                      </p>
                    </div>
                    <Switch
                      id="isPeriodic"
                      checked={formData.isPeriodic}
                      onCheckedChange={(checked) => {
                        setIsPeriodic(checked);
                        setFormData(({
                          ...formData,
                          isPeriodic: checked,
                          startDate: checked ? formData.startDate : '',
                          endDate: checked ? formData.endDate : '',
                        }));
                      }
                      }
                    />
                  </div>

                  {formData.isPeriodic && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Data de Início</Label>
                            <Input
                              id="startDate"
                              type="date"
                              min={dataPickerBlocked()}
                              max={formData.endDate ? formData.endDate : ''}
                              value={formData.startDate}
                              onLoad={() => {
                                carregarQtdCaixasPorPeriodo(formData.startDate, formData.endDate);
                              }}
                              onChange={(e) => {
                                setFormData({ ...formData, startDate: e.target.value, })
                                if (e.target.value && formData.endDate && e.target.value <= formData.endDate) {
                                  carregarQtdCaixasPorPeriodo(e.target.value, formData.endDate);
                                } else {
                                  setQtdCaixasPorPeriodo([]);
                                }

                              }
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">Data de Fim</Label>
                            <Input
                              id="endDate"
                              type="date"
                              min={formData.startDate ? formData.startDate : dataPickerBlocked()}
                              value={formData.endDate}
                              onLoad={() => {
                                carregarQtdCaixasPorPeriodo(formData.startDate, formData.endDate);
                              }}
                              onChange={(e) => {
                                setFormData({ ...formData, endDate: e.target.value, })
                                if (e.target.value && formData.startDate && formData.startDate <= e.target.value) {
                                  carregarQtdCaixasPorPeriodo(formData.startDate, e.target.value);
                                } else {
                                  setQtdCaixasPorPeriodo([]);
                                }
                              }
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {formData.isPeriodic && qtdCaixasPorPeriodo.length > 0 && formData.startDate && formData.endDate && formData.startDate <= formData.endDate && (
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
                        setIsPeriodic(false);
                        resetEditForm();
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
                  {selectedAgendamento.address}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAgendamento.address)}`,
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
                  {selectedAgendamento.user?.name}
                </p>
              </div>

              {/* Observações */}
              {selectedAgendamento.observations && (
                <div>
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-sm text-muted-foreground italic">
                    {selectedAgendamento.observations}
                  </p>
                </div>
              )}

              {/* Quantidade de Caixas */}
              <div>
                <h3 className="font-semibold mb-2">Quantidade de Caixas</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAgendamento.qtyBoxes} {"Caixa(s)"}
                </p>
              </div>

              {/* Alterar Status */}
              <div>
                <h3 className="font-semibold mb-2">Alterar Status</h3>
                <Select
                  value={selectedAgendamento.status}
                  onValueChange={(value) => {
                    handleStatusChange(
                      selectedAgendamento.id!,
                      value as Agendamento["status"],
                    );
                    setSelectedAgendamento({
                      ...selectedAgendamento,
                      status: value as Agendamento["status"],
                    });
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "border-l-4 font-medium transition-colors",
                      selectedAgendamento.status === "PENDING" &&
                      "border-l-[var(--accent)] bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20",
                      selectedAgendamento.status === "CONFIRMED" &&
                      "border-l-green-600 bg-green-50 dark:bg-green-950/30 dark:border-l-green-500",
                      selectedAgendamento.status === "COLLECTED" &&
                      "border-l-[var(--secondary)] bg-[var(--secondary)]/10 dark:bg-[var(--secondary)]/20",
                      selectedAgendamento.status === "CANCELLED" &&
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
                      selectedAgendamento.id!,
                      selectedAgendamento.client.name,
                    )
                  }
                >
                  Excluir Agendamento
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
