import React, { useState, useMemo } from "react";
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
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useData } from "../context/DataContext";
import { Container as ContainerType } from "../types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trash2,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Receipt,
  Banknote,
  CircleDollarSign,
  Target,
  TrendingDown as TrendingDownIcon,
  CheckCircle2,
  AlertCircle,
  Container as ContainerIcon,
  Package,
  Ship,
  MapPin,
  Clock,
  Weight,
  LayoutGrid,
  List,
  X,
  ArrowRight,
  FileText,
  Users,
  Boxes,
  Navigation,
  Anchor,
  Box,
  Truck,
  Globe,
  Edit,
  MoreVertical,
  Save,
  XCircle,
} from "lucide-react";
import {
  CreateContainersDTO,
  UpdateContainersDTO,
  containersServices,
} from "../services/containers.service";

type ViewMode = "grid" | "list" | "kanban";

interface ContainerEvento {
  id: string;
  tipo: "preparacao" | "embarque" | "transito" | "alfandega" | "entrega";
  descricao: string;
  local: string;
  data: Date;
  concluido: boolean;
}

export default function ContainersView() {
  const {
    containers,
    addContainer,
    updateContainer,
    deleteContainer,
    clientes,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    status: "todos" as
      | "todos"
      | "PREPARATION"
      | "IN_TRANSIT"
      | "DELIVERED"
      | "CANCELLED",
    origin: "",
    destination: "",
  });

  const [formData, setFormData] = useState({
    number: "",
    type: "",
    origin: "Miami, FL - USA",
    destination: "Santos, SP - Brasil",
    boardingDate: "",
    estimatedArrival: "",
    status: "PREPARATION" as
      | "PREPARATION"
      | "IN_TRANSIT"
      | "DELIVERED"
      | "CANCELLED",
    volume: "",
    weightLimit: "",
    trackingLink: "",
  });

  const resetForm = () => {
    setFormData({
      number: "",
      type: "",
      origin: "Miami, FL - USA",
      destination: "Santos, SP - Brasil",
      boardingDate: "",
      estimatedArrival: "",
      status: "PREPARATION" as
        | "PREPARATION"
        | "IN_TRANSIT"
        | "DELIVERED"
        | "CANCELLED",
      volume: "",
      weightLimit: "",
      trackingLink: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar tipo e valor do volume
    const tipoValido = ["C20FT", "C40FT", "C40FTHC", "C45FTHC"].includes(
      formData.type,
    );
    if (!formData.type || !tipoValido) {
      toast.error("Selecione o tipo de container");
      return;
    }

    // Validar se a data do embarque vem depois da data de chegada estimada
    const boardingDate = new Date(formData.boardingDate).getTime();
    const estimatedArrival = new Date(formData.estimatedArrival).getTime();

    if (Number(boardingDate) > Number(estimatedArrival)) {
      toast.error(
        "A data de embarque não pode ser maior que a data de chegada estimada.",
      );
      return;
    }

    const payload = {
      number: formData.number,
      type: formData.type as "C20FT" | "C40FT" | "C40FTHC" | "C45FTHC",
      origin: formData.origin,
      destination: formData.destination,
      boardingDate: formData.boardingDate,
      estimatedArrival: formData.estimatedArrival,
      volume: parseFloat(formData.volume) || 0,
      trackingLink: formData.trackingLink,
      weightLimit: parseFloat(formData.weightLimit) || 0,
      status: formData.status as
        | "PREPARATION"
        | "IN_TRANSIT"
        | "DELIVERED"
        | "CANCELLED",
      // totalWeight: 0,
      // boxes: [], // boxes será implementado posteriormente
    };

    const result = await containersServices.create(payload);

    if (result.success && result.data) {
      addContainer(result.data);
      toast.success("Container cadastrado com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    } else {
      toast.error(result.error ?? "Erro ao cadastrar container.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContainer) {
      toast.error("Nenhum container selecionado");
      return;
    }

    const tipoValido = ["C20FT", "C40FT", "C40FTHC", "C45FTHC"].includes(
      formData.type,
    );
    if (!formData.type || !tipoValido) {
      toast.error("Selecione o tipo de container");
      return;
    }

    const getUpdatePayload = (): UpdateContainersDTO => {
      const current = {
        number: formData.number,
        type: formData.type as "C20FT" | "C40FT" | "C40FTHC" | "C45FTHC",
        origin: formData.origin,
        destination: formData.destination,
        boardingDate: formData.boardingDate,
        estimatedArrival: formData.estimatedArrival,
        volume: parseFloat(formData.volume) || 0,
        weightLimit: parseFloat(formData.weightLimit) || 0,
        trackingLink: formData.trackingLink,
        status: formData.status as
          | "PREPARATION"
          | "IN_TRANSIT"
          | "DELIVERED"
          | "CANCELLED",
      };

      const original = selectedContainer!;
      const patch: UpdateContainersDTO = {};

      if (current.number !== original.number) patch.number = current.number;
      if (current.type !== original.type) patch.type = current.type;
      if (current.origin !== original.origin) patch.origin = current.origin;
      if (current.destination !== original.destination)
        patch.destination = current.destination;
      if (current.boardingDate !== original.boardingDate)
        patch.boardingDate = current.boardingDate;
      if (current.estimatedArrival !== original.estimatedArrival)
        patch.estimatedArrival = current.estimatedArrival;
      if (current.volume !== original.volume) patch.volume = current.volume;
      if (current.weightLimit !== original.weightLimit)
        patch.volume = current.weightLimit;
      if (current.trackingLink !== original.trackingLink)
        patch.trackingLink = current.trackingLink;
      if (current.status !== original.status) patch.status = current.status;

      return patch;
    };

    const patchPayload = getUpdatePayload();

    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    const result = await containersServices.update(
      selectedContainer.id,
      patchPayload,
    );

    if (result.success && result.data) {
      updateContainer(selectedContainer.id, patchPayload);
      toast.success("Container atualizado com sucesso!");
      resetForm();
      setIsEditDialogOpen(false);
      setIsEditing(false);
    } else {
      toast.error(result.error ?? "Erro ao atualizar container.");
      return;
    }
  };

  const handleDelete = async () => {
    if (!selectedContainer) {
      toast.error("Nenhum container selecionado");
      return;
    }

    const result = await containersServices.delete(selectedContainer.id);

    if (result.success) {
      deleteContainer(selectedContainer.id);
      toast.success("Container excluído com sucesso!");
      setSelectedContainer(null);
      setIsDeleteDialogOpen(false);
    } else {
      toast.error(result.error ?? "Erro ao excluir container.");
      return;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PREPARATION":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-500",
          text: "text-yellow-900",
          badge: "bg-yellow-100 text-yellow-700",
        };
      case "SHIPPED":
      case "IN_TRANSIT":
        return {
          bg: "bg-blue-50",
          border: "border-blue-500",
          text: "text-blue-900",
          badge: "bg-blue-100 text-blue-700",
        };
      case "DELIVERED":
        return {
          bg: "bg-green-50",
          border: "border-green-500",
          text: "text-green-900",
          badge: "bg-green-100 text-green-700",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-50",
          border: "border-red-500",
          text: "text-red-900",
          badge: "bg-red-100 text-red-700",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-500",
          text: "text-slate-900",
          badge: "bg-slate-100 text-slate-700",
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PREPARATION":
        return Package;
      case "SHIPPED":
        return Truck;
      case "IN_TRANSIT":
        return Ship;
      case "DELIVERED":
        return CheckCircle2;
      case "CANCELLED":
        return X;
      default:
        return ContainerIcon;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PREPARATION":
        return "Em Preparação";
      case "IN_TRANSIT":
        return "Em Trânsito";
      case "DELIVERED":
        return "Entregue";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  const filteredContainers = useMemo(() => {
    return containers.filter((container) => {
      // Search
      const matchesSearch =
        container.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.destination?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status
      if (filters.status !== "todos" && container.status !== filters.status) {
        return false;
      }

      // Origem
      if (
        filters.origin &&
        !container.origin?.toLowerCase().includes(filters.origin.toLowerCase())
      ) {
        return false;
      }

      // Destino
      if (
        filters.destination &&
        !container.destination
          ?.toLowerCase()
          .includes(filters.destination.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [containers, searchTerm, filters]);

  const statistics = useMemo(() => {
    const total = filteredContainers.length;
    const emPreparacao = filteredContainers.filter(
      (c) => c.status === "PREPARATION",
    ).length;
    const emTransito = filteredContainers.filter(
      (c) => c.status === "IN_TRANSIT",
    ).length;
    const entregues = filteredContainers.filter(
      (c) => c.status === "DELIVERED",
    ).length;
    // const totalCaixas = filteredContainers.reduce(
    //   (sum, c) => sum + (c.boxes?.length ?? 0),
    //   0,
    // );
    // const pesoTotal = filteredContainers.reduce(
    //   (sum, c) => sum + c.totalWeight,
    //   0,
    // );
    // const capacidadeMedia =
    //   filteredContainers.length > 0
    //     ? (filteredContainers.reduce(
    //         (sum, c) => sum + c.totalWeight / c.weightLimit,
    //         0,
    //       ) /
    //         filteredContainers.length) *
    //       100
    //     : 0;

    return {
      total,
      emPreparacao,
      emTransito,
      entregues,
      // totalCaixas, // totalCaixas será implementado posteriormente
      // pesoTotal,
      // capacidadeMedia,
    };
  }, [filteredContainers]);

  const dataPickerBlocked = () => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  };

  /** Extrai apenas YYYY-MM-DD da string, sem usar Date (evita +1/-1 dia por timezone no input type="date"). */
  const toDateOnlyForInput = (value: string | undefined | null): string => {
    if (value == null || value === "") return "";
    const s = String(value).trim();
    const match =
      s.match(/^\d{4}-\d{2}-\d{2}$/) || s.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? (match[1] ?? match[0]) : "";
  };

  const MESES_PT: string[] = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  /** Formata string YYYY-MM-DD para exibição, sem usar Date (evita +1/-1 dia por timezone). */
  const formatDateOnlyForDisplay = (
    value: string | undefined | null,
    kind: "short" | "medium" | "long",
  ): string => {
    const raw = toDateOnlyForInput(value);
    if (!raw) return value ? String(value) : "";
    const [y, m, d] = raw.split("-");
    if (!y || !m || !d) return raw;
    const dd = d.padStart(2, "0");
    const mm = m.padStart(2, "0");
    const yy = y.length >= 2 ? y.slice(-2) : y;
    if (kind === "short") return `${dd}/${mm}/${yy}`;
    if (kind === "medium") return `${dd}/${mm}/${y}`;
    const mes = MESES_PT[parseInt(m, 10) - 1] ?? mm;
    return `${dd} de ${mes} de ${y}`;
  };

  // Mock de eventos do container (em produção viria do backend)
  const getContainerEventos = (containerId: string): ContainerEvento[] => {
    return [
      {
        id: "1",
        tipo: "preparacao",
        descricao: "Container em preparação no armazém",
        local: "Miami, FL - USA",
        data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        concluido: true,
      },
      {
        id: "2",
        tipo: "embarque",
        descricao: "Embarque no porto de origem",
        local: "Port of Miami - USA",
        data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        concluido: true,
      },
      {
        id: "3",
        tipo: "transito",
        descricao: "Container em trânsito marítimo",
        local: "Oceano Atlântico",
        data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        concluido: true,
      },
      {
        id: "4",
        tipo: "alfandega",
        descricao: "Liberação alfandegária",
        local: "Santos, SP - Brasil",
        data: new Date(),
        concluido: selectedContainer?.status === "DELIVERED",
      },
      {
        id: "5",
        tipo: "entrega",
        descricao: "Entrega ao destinatário",
        local: selectedContainer?.destination || "São Paulo, SP",
        data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        concluido: false,
      },
    ];
  };

  const getEventoIcon = (tipo: ContainerEvento["tipo"]) => {
    switch (tipo) {
      case "preparacao":
        return Package;
      case "embarque":
        return Anchor;
      case "transito":
        return Ship;
      case "alfandega":
        return FileText;
      case "entrega":
        return Truck;
    }
  };

  const containersByStatus = useMemo(() => {
    return {
      preparacao: filteredContainers.filter((c) => c.status === "PREPARATION"),
      transito: filteredContainers.filter(
        (c) => c.status === "IN_TRANSIT" || c.status === "SHIPPED",
      ),
      entregue: filteredContainers.filter((c) => c.status === "DELIVERED"),
      cancelado: filteredContainers.filter((c) => c.status === "CANCELLED"),
    };
  }, [filteredContainers]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Gerenciamento de Containers
            </h2>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Rastreamento e controle de containers internacionais
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Container
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Container</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para registrar um novo container no
                    sistema
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número do Container *</Label>
                      <Input
                        id="number"
                        placeholder="Ex: MSKU1234567"
                        value={formData.number}
                        onChange={(e) =>
                          setFormData({ ...formData, number: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Container *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value as any })
                        }
                        required
                      >
                        <SelectTrigger id="type" required aria-required>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C20FT">20ft Standard</SelectItem>
                          <SelectItem value="C40FT">40ft Standard</SelectItem>
                          <SelectItem value="C40FTHC">
                            40ft High Cube
                          </SelectItem>
                          <SelectItem value="C45FTHC">
                            45ft High Cube
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origin">Porto de Origem *</Label>
                      <Input
                        id="origin"
                        placeholder="Ex: Miami, FL - USA"
                        value={formData.origin}
                        onChange={(e) =>
                          setFormData({ ...formData, origin: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">Porto de Destino *</Label>
                      <Input
                        id="destination"
                        placeholder="Ex: Santos, SP - Brasil"
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destination: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="boardingDate">Data de Embarque *</Label>
                      <Input
                        id="boardingDate"
                        type="date"
                        min={dataPickerBlocked()}
                        value={formData.boardingDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            boardingDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedArrival">
                        Previsão de Chegada *
                      </Label>
                      <Input
                        id="estimatedArrival"
                        type="date"
                        min={dataPickerBlocked()}
                        value={formData.estimatedArrival}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedArrival: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume (m³) *</Label>
                      <Input
                        id="volume"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 67.5"
                        value={formData.volume}
                        onChange={(e) =>
                          setFormData({ ...formData, volume: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightLimit">Limite de Peso (kg) *</Label>
                      <Input
                        id="weightLimit"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 28000"
                        value={formData.weightLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weightLimit: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="trackingLink">Link de Rastreamento</Label>
                      <Input
                        id="trackingLink"
                        type="url"
                        placeholder="Ex: https://tracking.example.com/CNT123456"
                        value={formData.trackingLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            trackingLink: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        URL completa do sistema de rastreamento do container
                      </p>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="status">Status Inicial *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value as any })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PREPARATION">
                            Em Preparação
                          </SelectItem>
                          <SelectItem value="IN_TRANSIT">
                            Em Trânsito
                          </SelectItem>
                          <SelectItem value="DELIVERED">Entregue</SelectItem>
                          <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Cadastrar Container</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <Card className="p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-blue-900">
                Total Containers
              </span>
              <ContainerIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-900">
              {statistics.total}
            </p>
            <p className="text-xs text-blue-700 mt-1">Containers ativos</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-yellow-900">
                Em Preparação
              </span>
              <Package className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-yellow-900">
              {statistics.emPreparacao}
            </p>
            <p className="text-xs text-yellow-700 mt-1">Sendo carregados</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-purple-900">
                Em Trânsito
              </span>
              <Ship className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-purple-900">
              {statistics.emTransito}
            </p>
            <p className="text-xs text-purple-700 mt-1">No oceano</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-green-900">
                Entregues
              </span>
              <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-900">
              {statistics.entregues}
            </p>
            <p className="text-xs text-green-700 mt-1">Completos</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-orange-900">
                Total Caixas
              </span>
              <Boxes className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
            </div>
            {/* <p className="text-2xl lg:text-3xl font-bold text-orange-900">
              {statistics.totalCaixas}
            </p> */}
            <p className="text-xs text-orange-700 mt-1">Unidades</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-slate-900">
                Peso Total
              </span>
              <Weight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
            </div>
            {/* <p className="text-2xl lg:text-3xl font-bold text-slate-900">
              {statistics.pesoTotal.toFixed(0)}
            </p> */}
            <p className="text-xs text-slate-700 mt-1">Quilogramas</p>
          </Card>
        </div>

        {/* Barra de Busca e View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, origem ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex-1 sm:flex-none"
            >
              <LayoutGrid className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Grid</span>
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
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="flex-1 sm:flex-none"
            >
              <Boxes className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
          </div>
        </div>

        {/* Painel de Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="space-y-4">
                  {/* Filtro de Status */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-slate-700">
                      🚢 Status do Container
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(
                        [
                          "todos",
                          "PREPARATION",
                          "IN_TRANSIT",
                          "DELIVERED",
                          "CANCELLED",
                        ] as const
                      ).map((status) => {
                        const statusColors: Record<string, string> = {
                          todos: "bg-slate-600",
                          PREPARATION: "bg-yellow-500",
                          IN_TRANSIT: "bg-purple-500",
                          DELIVERED: "bg-green-500",
                          CANCELLED: "bg-red-500",
                        };
                        const statusLabels: Record<string, string> = {
                          todos: "Todos",
                          PREPARATION: "Em Preparação",
                          IN_TRANSIT: "Em Trânsito",
                          DELIVERED: "Entregue",
                          CANCELLED: "Cancelado",
                        };
                        const isSelected = filters.status === status;
                        return (
                          <Badge
                            key={status}
                            onClick={() => setFilters({ ...filters, status })}
                            className={`cursor-pointer px-4 py-2 transition-all ${
                              isSelected
                                ? `${statusColors[status]} text-white hover:opacity-90`
                                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {statusLabels[status]}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtros de Localização */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-3 block text-slate-700">
                        📍 Origem
                      </label>
                      <Input
                        placeholder="Miami, FL..."
                        value={filters.origin}
                        onChange={(e) =>
                          setFilters({ ...filters, origin: e.target.value })
                        }
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-3 block text-slate-700">
                        🎯 Destino
                      </label>
                      <Input
                        placeholder="São Paulo, SP..."
                        value={filters.destination}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            destination: e.target.value,
                          })
                        }
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-600">
                    {filteredContainers.length} container(s) encontrado(s)
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        status: "todos",
                        origin: "",
                        destination: "",
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

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredContainers.map((container) => {
              const colors = getStatusColor(container.status);
              const StatusIcon = getStatusIcon(container.status);
              // const capacidade =
              //   (container.totalWeight / container.weightLimit) * 100;

              return (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`hover:shadow-xl transition-all cursor-pointer border-l-4 ${colors.border} ${colors.bg} group`}
                    onClick={() => setSelectedContainer(container)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${colors.bg}`}>
                            <StatusIcon className={`w-6 h-6 ${colors.text}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {container.number}
                            </CardTitle>
                            <Badge className={colors.badge}>
                              {getStatusLabel(container.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{container.origin}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                          {container.destination}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Embarque</p>
                          <p className="font-semibold">
                            {formatDateOnlyForDisplay(
                              container.boardingDate,
                              "short",
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Previsão</p>
                          <p className="font-semibold">
                            {formatDateOnlyForDisplay(
                              container.estimatedArrival,
                              "short",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Capacidade
                          </span>
                          {/* <span className="font-semibold">
                            {container.totalWeight} / {container.weightLimit} kg
                          </span> */}
                        </div>
                        {/* <Progress value={capacidade} className="h-2" /> */}
                        {/* <p className="text-xs text-muted-foreground">
                          {capacidade.toFixed(1)}% utilizado
                        </p> */}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          {/* <span className="text-muted-foreground flex items-center gap-1">
                            <Box className="w-4 h-4" />
                            Caixas
                          </span> */}
                          {/* <Badge variant="outline">
                            {container.boxes?.length || 0}
                          </Badge> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredContainers.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <ContainerIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum container encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Containers</CardTitle>
            <CardDescription>
              {filteredContainers.length} container(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {filteredContainers.map((container) => {
                  const colors = getStatusColor(container.status);
                  const StatusIcon = getStatusIcon(container.status);
                  // const capacidade =
                  //   (container.totalWeight / container.weightLimit) * 100;

                  // Validar datas
                  return (
                    <motion.div
                      key={container.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group"
                    >
                      <Card
                        className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${colors.border}`}
                        onClick={() => setSelectedContainer(container)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`p-3 rounded-full ${colors.bg}`}>
                                <StatusIcon
                                  className={`w-6 h-6 ${colors.text}`}
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">
                                    {container.number}
                                  </h3>
                                  <Badge className={colors.badge}>
                                    {getStatusLabel(container.status)}
                                  </Badge>
                                  {/* <Badge variant="outline">
                                    {container.boxes?.length || 0} caixas
                                  </Badge> */}
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Rota
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-blue-600" />
                                      <span className="font-medium">
                                        {container.origin || "N/A"}
                                      </span>
                                      <ArrowRight className="w-3 h-3" />
                                      <MapPin className="w-3 h-3 text-green-600" />
                                      <span className="font-medium">
                                        {container.destination || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Embarque
                                    </p>
                                    <p className="font-semibold">
                                      {formatDateOnlyForDisplay(
                                        container.boardingDate,
                                        "medium",
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Previsão
                                    </p>
                                    <p className="font-semibold">
                                      {formatDateOnlyForDisplay(
                                        container.estimatedArrival,
                                        "medium",
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Capacidade
                                    </p>
                                    {/* <p className="font-semibold">
                                      {capacidade.toFixed(0)}%
                                    </p> */}
                                    {/* <Progress
                                      value={capacidade}
                                      className="h-1 mt-1"
                                    /> */}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Button variant="ghost" size="icon">
                              <ArrowRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredContainers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ContainerIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum container encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid gap-4 md:grid-cols-4">
          {/* Coluna Em Preparação */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-yellow-600" />
                Em Preparação
                <Badge className="bg-yellow-200 text-yellow-800 ml-auto">
                  {containersByStatus.preparacao.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {containersByStatus.preparacao.map((container) => (
                <Card
                  key={container.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedContainer(container)}
                >
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-semibold text-sm">
                      {container.number}
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        {container.origin || "N/A"} →{" "}
                        {container.destination || "N/A"}
                      </p>
                      {/* <p className="mt-1">
                        {container.boxes?.length || 0} caixas
                      </p> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Coluna Em Trânsito */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-600" />
                Em Trânsito
                <Badge className="bg-blue-200 text-blue-800 ml-auto">
                  {containersByStatus.transito.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {containersByStatus.transito.map((container) => (
                <Card
                  key={container.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedContainer(container)}
                >
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-semibold text-sm">
                      {container.number}
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        {container.origin || "N/A"} →{" "}
                        {container.destination || "N/A"}
                      </p>
                      {/* <p className="mt-1">
                        {container.boxes?.length || 0} caixas
                      </p> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Coluna Entregue */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Entregue
                <Badge className="bg-green-200 text-green-800 ml-auto">
                  {containersByStatus.entregue.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {containersByStatus.entregue.map((container) => (
                <Card
                  key={container.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedContainer(container)}
                >
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-semibold text-sm">
                      {container.number}
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        {container.origin || "N/A"} →{" "}
                        {container.destination || "N/A"}
                      </p>
                      {/* <p className="mt-1">
                        {container.boxes?.length || 0} caixas
                      </p> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Coluna Cancelado */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <X className="w-4 h-4 text-red-600" />
                Cancelado
                <Badge className="bg-red-200 text-red-800 ml-auto">
                  {containersByStatus.cancelado.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {containersByStatus.cancelado.map((container) => (
                <Card
                  key={container.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedContainer(container)}
                >
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-semibold text-sm">
                      {container.number}
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        {container.origin} → {container.destination}
                      </p>
                      {/* <p className="mt-1">{container.boxes.length} caixas</p> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Painel Lateral - Detalhes do Container */}
      <AnimatePresence>
        {selectedContainer && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[700px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-border p-4 lg:p-6 z-10">
              <div className="flex flex-col gap-4">
                {/* Primeira linha - Ícone, Título e Fechar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                    <div className="bg-blue-500 p-3 lg:p-4 rounded-full flex-shrink-0">
                      <ContainerIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg lg:text-2xl font-bold text-foreground mb-2 truncate">
                        {selectedContainer.number}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={
                            getStatusColor(selectedContainer.status).badge
                          }
                        >
                          {getStatusLabel(selectedContainer.status)}
                        </Badge>
                        <Badge variant="outline">
                          {selectedContainer.boxes?.length || 0} caixas
                        </Badge>
                        <Badge variant="outline">
                          {selectedContainer.totalWeight || 0} kg
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContainer(null)}
                    className="flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Segunda linha - Botões de ação */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        number: selectedContainer.number || "",
                        type: selectedContainer.type as
                          | "C20FT"
                          | "C40FT"
                          | "C40FTHC"
                          | "C45FTHC",
                        origin: selectedContainer.origin || "",
                        destination: selectedContainer.destination || "",
                        boardingDate: toDateOnlyForInput(
                          selectedContainer.boardingDate,
                        ),
                        estimatedArrival: toDateOnlyForInput(
                          selectedContainer.estimatedArrival,
                        ),
                        status: selectedContainer.status || "PREPARATION",
                        volume: selectedContainer.volume?.toString() || "0",
                        weightLimit:
                          selectedContainer.weightLimit?.toString() || "0",
                        trackingLink: selectedContainer.trackingLink || "",
                      });
                      setIsEditDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informações de Rota */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Rota Internacional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Origem
                        </span>
                      </div>
                      <p className="font-semibold">
                        {selectedContainer.origin}
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Destino
                        </span>
                      </div>
                      <p className="font-semibold">
                        {selectedContainer.destination}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Data de Embarque
                      </p>
                      <p className="font-semibold">
                        {formatDateOnlyForDisplay(
                          selectedContainer.boardingDate,
                          "long",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Previsão de Chegada
                      </p>
                      <p className="font-semibold">
                        {formatDateOnlyForDisplay(
                          selectedContainer.estimatedArrival,
                          "long",
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedContainer.trackingLink && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Link de Rastreamento
                      </p>
                      <a
                        href={selectedContainer.trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        Rastrear Container
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline de Rastreamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Rastreamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getContainerEventos(selectedContainer.id).map(
                      (evento, index) => {
                        const Icon = getEventoIcon(evento.tipo);
                        const isLast =
                          index ===
                          getContainerEventos(selectedContainer.id).length - 1;

                        return (
                          <div key={evento.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`p-2 rounded-full ${
                                  evento.concluido
                                    ? "bg-green-100"
                                    : "bg-slate-100"
                                }`}
                              >
                                <Icon
                                  className={`w-4 h-4 ${
                                    evento.concluido
                                      ? "text-green-600"
                                      : "text-slate-400"
                                  }`}
                                />
                              </div>
                              {!isLast && (
                                <div
                                  className={`w-0.5 flex-1 min-h-[40px] ${
                                    evento.concluido
                                      ? "bg-green-200"
                                      : "bg-slate-200"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`font-semibold ${
                                    evento.concluido
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {evento.descricao}
                                </h4>
                                {evento.concluido && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {evento.local}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(evento.data, "dd/MM/yyyy 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Capacidade do Container */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Weight className="w-5 h-5" />
                    Capacidade e Peso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Peso Utilizado
                      </span>
                      <span className="font-semibold">
                        {selectedContainer.totalWeight} /{" "}
                        {selectedContainer.weightLimit} kg
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedContainer.totalWeight /
                          selectedContainer.weightLimit) *
                        100
                      }
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(
                        (selectedContainer.totalWeight /
                          selectedContainer.weightLimit) *
                        100
                      ).toFixed(1)}
                      % da capacidade máxima
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Volume
                      </p>
                      <p className="font-semibold">
                        {selectedContainer.volume} m³
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                      <p className="font-semibold">{selectedContainer.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Caixas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    {/* Caixas no Container ({selectedContainer.boxes.length}) */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedContainer.boxes.map(
                      (caixa: any, index: number) => (
                        <Card key={index} className="bg-slate-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-semibold">
                                    {caixa.clientName}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>#{caixa.boxNumber}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {caixa.size}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">
                                  {caixa.weight} kg
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Container</DialogTitle>
            <DialogDescription>
              Atualize os dados do container no sistema
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número do Container *</Label>
                <Input
                  id="number"
                  placeholder="Ex: MSKU1234567"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Container *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as any })
                  }
                  required
                >
                  <SelectTrigger id="type" required aria-required>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C20FT">20ft Standard</SelectItem>
                    <SelectItem value="C40FT">40ft Standard</SelectItem>
                    <SelectItem value="C40FTHC">40ft High Cube</SelectItem>
                    <SelectItem value="C45FTHC">45ft High Cube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Porto de Origem *</Label>
                <Input
                  id="origin"
                  placeholder="Ex: Miami, FL - USA"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Porto de Destino *</Label>
                <Input
                  id="destination"
                  placeholder="Ex: Santos, SP - Brasil"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boardingDate">Data de Embarque *</Label>
                <Input
                  id="boardingDate"
                  type="date"
                  min={dataPickerBlocked()}
                  value={formData.boardingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, boardingDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedArrival">Previsão de Chegada *</Label>
                <Input
                  id="estimatedArrival"
                  type="date"
                  min={dataPickerBlocked()}
                  value={formData.estimatedArrival}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedArrival: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume (m³) *</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 67.5"
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData({ ...formData, volume: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightLimit">Limite de Peso (kg) *</Label>
                <Input
                  id="weightLimit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 28000"
                  value={formData.weightLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, weightLimit: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="trackingLinkEdit">Link de Rastreamento</Label>
                <Input
                  id="trackingLinkEdit"
                  type="url"
                  placeholder="Ex: https://tracking.example.com/CNT123456"
                  value={formData.trackingLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trackingLink: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  URL completa do sistema de rastreamento do container
                </p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="status">Status Inicial *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as any })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREPARATION">Em Preparação</SelectItem>
                    <SelectItem value="IN_TRANSIT">Em Trânsito</SelectItem>
                    <SelectItem value="DELIVERED">Entregue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                  setIsEditing(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Atualizar Container</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Excluir Container</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este container? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedContainer && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-3 rounded-full">
                      <ContainerIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">
                        {selectedContainer.number}
                      </h3>
                      <p className="text-sm text-red-700">
                        {selectedContainer.origin} →{" "}
                        {selectedContainer.destination}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Container
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
