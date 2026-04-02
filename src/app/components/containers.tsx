import React, { useState, useMemo, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useData } from "../context/DataContext";
import type { Container } from "../api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Download,
  PieChart as PieChartIcon,
  TrendingDown as TrendingDownIcon,
  Container as ContainerIcon,
  Package,
  Ship,
  LayoutGrid,
  List,
  X,
  FileText,
  Boxes,
  Anchor,
  Truck,
} from "lucide-react";
import {
  CONTAINER_STATUS_ITEMS,
  ContainersViewMode as ViewMode,
  containersCrud,
  ContainersCreateDialog,
  ContainersDeleteDialog,
  ContainersEditDialog,
  dataPickerBlocked,
  formatDateOnlyForDisplay,
  getContainerStatusColor as getStatusColor,
  getContainersByStatus,
  getContainerStatusIcon as getStatusIcon,
  getContainerStatusLabel as getStatusLabel,
  handleContainerStatusChange as handleContainerStatusChangeAction,
  handleCreateContainer,
  handleDeleteContainer,
  handleUpdateContainer,
  toDateOnlyForInput,
  useContainersForm,
  ContainersMetricsCards,
  ContainersContentView,
  ContainersSidePanel,
} from "./containers/index";

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
    setContainers,
    addContainer,
    updateContainer,
    deleteContainer,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  );
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

  const { formData, setFormData, resetForm, fillFormFromContainer } =
    useContainersForm();

  useEffect(() => {
    const carregarContainers = async () => {
      const result = await containersCrud.getAll();
      if (result.success && result.data) {
        setContainers(result.data);
      }
    };
    carregarContainers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateContainer({
      formData,
      create: containersCrud.create,
      addContainer,
      onSuccess: () => {
      resetForm();
      setIsDialogOpen(false);
      },
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContainer) {
      toast.error("Nenhum container selecionado");
      return;
    }

    await handleUpdateContainer({
      selectedContainer,
      formData,
      update: containersCrud.update,
      updateContainer,
      setSelectedContainer,
      onSuccess: () => {
      resetForm();
      setIsEditDialogOpen(false);
      setIsEditing(false);
      },
    });
  };

  const handleDelete = async () => {
    if (!selectedContainer) {
      toast.error("Nenhum container selecionado");
      return;
    }

    await handleDeleteContainer({
      selectedContainer,
      remove: containersCrud.delete,
      deleteContainer,
      setSelectedContainer,
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  const handleContainerStatusChange = async (
    id: string,
    status: Container["status"],
  ) =>
    handleContainerStatusChangeAction({
      id,
      status,
      update: containersCrud.update,
      updateContainer,
      setSelectedContainer,
    });

  const handleContainerVolumesUpdated = async (updated: Container) => {
    if (!updated.id) return;
    updateContainer(updated.id, updated);
    setSelectedContainer(updated);

    const fresh = await containersCrud.getById(updated.id);
    if (fresh.success && fresh.data) {
      updateContainer(updated.id, fresh.data);
      setSelectedContainer(fresh.data);
    }
  };

  const handleTransferCompleted = async ({
    source,
    target,
  }: {
    source: Container;
    target: Container;
  }) => {
    const refreshOne = async (c: Container) => {
      if (!c.id) return;
      const r = await containersCrud.getById(c.id);
      if (r.success && r.data) {
        updateContainer(c.id, r.data);
        setSelectedContainer((prev) => (prev?.id === c.id ? r.data! : prev));
      }
    };
    await refreshOne(source);
    await refreshOne(target);
  };

  const handleContainerOrderUnlinked = async (
    containerId: string,
    driverServiceOrderId: string,
  ) => {
    const result = await containersCrud.unassignServiceOrder(
      containerId,
      driverServiceOrderId,
    );
    if (result.success && result.data) {
      await handleContainerVolumesUpdated(result.data);
      toast.success("Ordem removida do container.");
      return;
    }
    toast.error(result.error ?? "Não foi possível remover a ordem do container.");
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
    //         (sum, c) => sum + c.totalWeight / (c.fullWeight || 1),
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

  const containersByStatus = useMemo(
    () => getContainersByStatus(filteredContainers),
    [filteredContainers],
  );

  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
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
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
            <ContainersCreateDialog
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              formData={formData}
              setFormData={setFormData}
              resetForm={resetForm}
              onSubmit={handleSubmit}
              dataPickerBlocked={dataPickerBlocked}
            />

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <ContainersMetricsCards statistics={statistics} />

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
                            className={`cursor-pointer px-4 py-2 transition-all ${isSelected
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

                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-4 border-t border-slate-200">
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

      <ContainersContentView
        viewMode={viewMode}
        filteredContainers={filteredContainers}
        containersByStatus={containersByStatus}
        setSelectedContainer={setSelectedContainer}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getStatusLabel={getStatusLabel}
        formatDateOnlyForDisplay={formatDateOnlyForDisplay}
      />

      <ContainersSidePanel
        selectedContainer={selectedContainer}
        setSelectedContainer={setSelectedContainer}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        formatDateOnlyForDisplay={formatDateOnlyForDisplay}
        getContainerEventos={getContainerEventos}
        fillFormFromContainer={fillFormFromContainer}
        toDateOnlyForInput={toDateOnlyForInput}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleContainerStatusChange={handleContainerStatusChange}
        statusItems={CONTAINER_STATUS_ITEMS}
        onContainerVolumesUpdated={handleContainerVolumesUpdated}
        onUnassignServiceOrder={handleContainerOrderUnlinked}
        allContainers={containers}
        onTransferCompleted={handleTransferCompleted}
      />

      <ContainersEditDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        resetForm={resetForm}
        setIsEditing={setIsEditing}
        onSubmit={handleEditSubmit}
        dataPickerBlocked={dataPickerBlocked}
      />

      <ContainersDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        selectedContainer={selectedContainer}
        onDelete={handleDelete}
      />
    </div>
  );
}
