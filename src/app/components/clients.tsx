import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useData } from "../context/DataContext";
import type { Client } from "../api";
import {
  Search,
  Edit,
  Trash2,
  User,
  Filter,
  Download,
  LayoutGrid,
  List,
  X,
  Calendar,
  Users as UsersIcon,
  Package,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import {
  ATIVIDADE_COLOR_CLASSES,
  ClientsViewMode as ViewMode,
  CLIENT_HISTORY_FIELD_LABEL,
  ClienteAtividade,
  HistoricoPaginado,
  HISTORY_PAGE_SIZE,
  clientsCrud,
  buildClientUpdatePayload,
  formatCepBrasil,
  handleCallTelephone,
  handleCepBrasilChange,
  handleDeleteClient,
  handleExportClients,
  handleImportClients,
  handleWhatsappWindow,
  loadHistoricoPage,
  ClientsContentView,
  ClientsMetricsCards,
  ClientsFormDialog,
  ClientsSidePanel,
  useClientsForm,
} from "./clients/index";

export default function ClientesView() {
  const { user } = useAuth();
  const { clientes, setClientes, addCliente, updateCliente, deleteCliente } =
    useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [editingCliente, setEditingCliente] = useState<Client | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Client | null>(null);
  /** Histórico de atividades por cliente (paginado, 7 por página) */
  const [historicoPorCliente, setHistoricoPorCliente] = useState<
    Record<string, HistoricoPaginado>
  >({});
  const [loadingHistoricoId, setLoadingHistoricoId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [listVisibleCount, setListVisibleCount] = useState(40);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [filters, setFilters] = useState({
    estado: "",
    atendente: "",
    periodo: "todos" as "todos" | "semana" | "mes" | "ano",
  });

  useEffect(() => {
    const carregarClientes = async () => {
      const result = await clientsCrud.getAll();
      if (result.success && result.data) {
        setClientes(result.data);
      } else if (result.error) {
        toast.error(result.error);
      }
    };
    carregarClientes();
  }, [setClientes]);

  const loadHistoricoPageLocal = (clientId: string, page: number) =>
    loadHistoricoPage({
      clientId,
      page,
      history: clientsCrud.history,
      pageSize: HISTORY_PAGE_SIZE,
      setLoadingHistoricoId,
      setHistoricoPorCliente,
    });

  /** Ao abrir o painel, carrega a página 1 do histórico se ainda não tiver */
  useEffect(() => {
    if (!selectedCliente?.id) return;
    const clientId = selectedCliente.id;
    if (historicoPorCliente[clientId]) return; // já tem dados (qualquer página)

    loadHistoricoPageLocal(clientId, 1);
  }, [selectedCliente?.id]);

  const { formData, setFormData, resetForm, handleEdit, getCreatePayload } =
    useClientsForm({
      setEditingCliente,
      setIsDialogOpen,
    });

  const handleCepBrasilChangeLocal = async (cep: string) =>
    handleCepBrasilChange({ cep, setLoadingCep, setFormData });

  const handleCreate = async () => {
    const payload = getCreatePayload();
    if (payload.usaName.length < 2) {
      toast.error("Nome (USA) deve ter pelo menos 2 caracteres.");
      return;
    }
    if (payload.brazilName.length < 2) {
      toast.error("Nome recebedor (Brasil) deve ter pelo menos 2 caracteres.");
      return;
    }
    if (!payload.userId?.trim()) {
      toast.error("Atendente (usuário) é obrigatório.");
      return;
    }
    const result = await clientsCrud.create(payload);
    if (result.success && result.data) {
      const data = result.data;
      addCliente({
        ...data,
        user: data.user ?? { id: payload.userId, name: user?.nome ?? "" },
      });
      toast.success("Cliente cadastrado com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    } else {
      toast.error(result.error || "Erro ao cadastrar cliente");
    }
  };

  const handleUpdate = async () => {
    const patchPayload = buildClientUpdatePayload(formData, editingCliente!);
    if (Object.keys(patchPayload).length === 0) {
      toast.info("Nenhum campo alterado.");
      return;
    }

    const possiveisCampos = [
      "usaName",
      "usaCpf",
      "usaPhone",
      "usaAddress",
      "brazilName",
      "brazilCpf",
      "brazilPhone",
      "brazilAddress",
      "userId",
      "status",
    ] as const;

    const camposAlterados = Object.keys(
      patchPayload,
    ) as (typeof possiveisCampos)[number][];

    const old: Record<string, unknown> = {
      usaName: editingCliente!.usaNome,
      usaCpf: editingCliente!.usaCpf,
      usaPhone: editingCliente!.usaPhone,
      usaAddress: editingCliente!.usaAddress,
      brazilName: editingCliente!.brazilNome,
      brazilCpf: editingCliente!.brazilCpf,
      brazilPhone: editingCliente!.brazilPhone,
      brazilAddress: editingCliente!.brazilAddress,
      userId: editingCliente!.user?.id ?? "",
      status: editingCliente!.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    };

    const payloadBeforeAfter = Object.fromEntries(
      camposAlterados.map((c) => [
        c,
        {
          before: old[c],
          after: patchPayload[c as keyof typeof patchPayload],
        },
      ]),
    );

    const result = await clientsCrud.update(
      editingCliente!.id,
      patchPayload,
      payloadBeforeAfter,
    );

    if (!result.success) {
      toast.error(result.error || "Erro ao atualizar cliente");
      return;
    }

    const clienteData: Client = {
      id: editingCliente!.id,
      usaNome: formData.usaName,
      usaCpf: formData.usaCpf,
      usaPhone: formData.usaPhone,
      usaAddress: formData.usaAddress,
      brazilNome: formData.brazilName,
      brazilCpf: formData.brazilCpf,
      brazilPhone: formData.brazilPhone,
      brazilAddress: formData.brazilAddress,
      user: editingCliente!.user ?? { id: formData.userId, name: "" },
      dataCadastro: editingCliente!.dataCadastro,
      status: formData.status as "ACTIVE" | "INACTIVE",
    };

    updateCliente(editingCliente!.id, result.data ?? clienteData);
    toast.success("Cliente atualizado com sucesso!");
    if (selectedCliente?.id === editingCliente!.id) {
      setSelectedCliente(result.data ?? clienteData);
    }
    resetForm();
    setIsDialogOpen(false);
    loadHistoricoPageLocal(editingCliente!.id, 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCliente) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleDelete = async (id: string, nome: string) =>
    handleDeleteClient({
      id,
      nome,
      remove: clientsCrud.delete,
      deleteCliente,
      selectedClienteId: selectedCliente?.id,
      setSelectedCliente,
    });

  const handleExport = async () => handleExportClients(clientsCrud.export);

  /** Importação de clientes em desenvolvimento */
  const handleImport = async (file: File | null) => handleImportClients(file);
  const handleCallTelphone = (telefones: string[]) =>
    handleCallTelephone(telefones);
  const handleWhatsAppWindow = (telefones: string[]) =>
    handleWhatsappWindow(telefones);

  // TODO - Documentos do Cliente

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      // Search
      const usaAddr = cliente.usaAddress as { cidade?: string };
      const brAddr = cliente.brazilAddress as { cidade?: string };
      const matchesSearch =
        cliente.usaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.usaCpf.includes(searchTerm) ||
        cliente.usaPhone.includes(searchTerm) ||
        (usaAddr?.cidade ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cliente.brazilNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.brazilCpf.includes(searchTerm) ||
        cliente.brazilPhone.includes(searchTerm) ||
        (brAddr?.cidade ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Estado
      const usaEstado =
        (cliente.usaAddress as { estado?: string })?.estado ?? "";
      if (
        filters.estado &&
        !usaEstado.toLowerCase().includes(filters.estado.toLowerCase())
      ) {
        return false;
      }

      // Atendente
      if (
        filters.atendente &&
        !(cliente.user?.name ?? "")
          .toLowerCase()
          .includes(filters.atendente.toLowerCase())
      ) {
        return false;
      }

      // Período
      if (filters.periodo !== "todos") {
        const now = new Date();
        const cadastroDate = new Date(cliente.dataCadastro);

        if (filters.periodo === "semana") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (cadastroDate < weekAgo) return false;
        } else if (filters.periodo === "mes") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (cadastroDate < monthAgo) return false;
        } else if (filters.periodo === "ano") {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          if (cadastroDate < yearAgo) return false;
        }
      }

      return true;
    });
  }, [clientes, searchTerm, filters]);

  const statistics = useMemo(() => {
    const ativos = filteredClientes.filter((c) => c.status === "ACTIVE").length;
    const total = ativos;

    // const total = filteredClientes.length;
    // const inativos = filteredClientes.filter((c) => c.status === "inativo").length;

    const novosUltimaSemana = filteredClientes.filter((c) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(c.dataCadastro) >= weekAgo;
    }).length;

    const estadosUnicos = new Set(
      filteredClientes.map(
        (c) => (c.usaAddress as { estado?: string })?.estado ?? "",
      ),
    ).size;
    const cidadesBrasilUnicas = new Set(
      filteredClientes.map(
        (c) => (c.brazilAddress as { cidade?: string })?.cidade ?? "",
      ),
    ).size;

    return { total, novosUltimaSemana, estadosUnicos, cidadesBrasilUnicas };
  }, [filteredClientes]);

  const clientesListRendered = useMemo(
    () => filteredClientes.slice(0, listVisibleCount),
    [filteredClientes, listVisibleCount],
  );

  useEffect(() => {
    setListVisibleCount(40);
    if (listContainerRef.current) listContainerRef.current.scrollTop = 0;
  }, [searchTerm, filters, viewMode]);

  const getAtividadeIcon = (a: ClienteAtividade) => {
    if (a.origem === "appointment" || a.tipo === "agendamento") return Calendar;
    if (a.origem === "container") return Package;
    switch (a.tipo) {
      case "cadastro":
        return User;
      case "container":
        return Package;
      case "atualizacao":
        return Edit;
      case "exclusao":
        return Trash2;
      default:
        return Edit;
    }
  };

  /** Cliente: azul/laranja/vermelho. Agendamento: esmeralda/ciano/rosa (distinto do cliente). */
  const getAtividadeColor = (
    a: ClienteAtividade,
  ): keyof typeof ATIVIDADE_COLOR_CLASSES => {
    if (a.origem === "appointment") {
      if (a.tipo === "cadastro") return "emerald";
      if (a.tipo === "atualizacao") return "cyan";
      if (a.tipo === "exclusao") return "rose";
      return "cyan";
    }
    if (a.tipo === "agendamento") return "green";
    switch (a.tipo) {
      case "cadastro":
        return "blue";
      case "container":
        return "purple";
      case "atualizacao":
        return "orange";
      case "exclusao":
        return "red";
      default:
        return "orange";
    }
  };

  /** Tipos de atividade que exibem o bloco expansível (details/summary). Ajuste o array para incluir outros. */
  const showDetailsForAtividade = (atividade: ClienteAtividade): boolean => {
    const tiposComDetails: ClienteAtividade["tipo"][] = ["atualizacao"];
    return tiposComDetails.includes(atividade.tipo);
  };

  /** Formata valor do histórico para exibição (evita [object Object] em JSON/objetos). */
  const formatFieldValue = (val: unknown): string => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val);
  };

  /** Rótulos amigáveis para os campos do histórico. */
  const getFieldLabel = (key: string) => CLIENT_HISTORY_FIELD_LABEL[key] ?? key;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Clientes
            </h2>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Gerencie o cadastro de clientes e destinatários
            </p>
          </div>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            {/* Importação de clientes - Json e Excel */}
            <Dialog
              open={isImportDialogOpen}
              onOpenChange={(open) => {
                setIsImportDialogOpen(open);
                if (!open) setImportFile(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Clientes</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Selecione ou arraste e solte o arquivo para importar os
                  clientes.
                </DialogDescription>
                <div className="flex flex-col gap-6 w-full py-2">
                  <label
                    htmlFor="file-import-clientes"
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/40 bg-muted/30 px-8 py-12 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Clique ou arraste o arquivo aqui
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Formatos aceitos: .json, .xlsx, .csv
                    </span>
                    <Input
                      id="file-import-clientes"
                      type="file"
                      accept=".json,.xlsx,.csv"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setImportFile(f ?? null);
                      }}
                    />
                  </label>
                  <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    {importFile ? (
                      <>
                        <span
                          className="min-w-0 flex-1 break-words text-foreground"
                          title={importFile.name}
                        >
                          <strong>Arquivo selecionado:</strong>{" "}
                          {importFile.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 h-8 w-8 p-0"
                          onClick={() => {
                            setImportFile(null);
                            const input = document.getElementById(
                              "file-import-clientes",
                            ) as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          aria-label="Remover arquivo"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Nenhum arquivo selecionado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setIsImportDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      type="button"
                      onClick={() => handleImport(importFile)}
                    >
                      Confirmar Importação
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ClientsFormDialog
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              editingCliente={editingCliente}
              formData={formData}
              setFormData={setFormData}
              resetForm={resetForm}
              handleSubmit={handleSubmit}
              loadingCep={loadingCep}
              onCepChange={handleCepBrasilChangeLocal}
              formatCepBrasil={formatCepBrasil}
              user={user ? { id: user.id, nome: user.nome } : null}
            />
          </div>
        </div>

        <ClientsMetricsCards statistics={statistics} />

        {/* Barra de Busca e View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, telefone ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1 w-full sm:w-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex-1 sm:flex-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1 sm:flex-none"
            >
              <List className="w-4 h-4" />
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
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Período de Cadastro
                    </label>
                    <select
                      value={filters.periodo}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          periodo: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="semana">Última Semana</option>
                      <option value="mes">Último Mês</option>
                      <option value="ano">Último Ano</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Estado (USA)
                    </label>
                    <Input
                      placeholder="FL, NY, CA..."
                      value={filters.estado}
                      onChange={(e) =>
                        setFilters({ ...filters, estado: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Atendente
                    </label>
                    <Input
                      placeholder="Nome do atendente..."
                      value={filters.atendente}
                      onChange={(e) =>
                        setFilters({ ...filters, atendente: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        estado: "",
                        atendente: "",
                        periodo: "todos",
                      })
                    }
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ClientsContentView
        viewMode={viewMode}
        filteredClientes={filteredClientes}
        clientesListRendered={clientesListRendered}
        listVisibleCount={listVisibleCount}
        listContainerRef={listContainerRef}
        setListVisibleCount={setListVisibleCount}
        setSelectedCliente={setSelectedCliente}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ClientsSidePanel
        selectedCliente={selectedCliente}
        loadingHistoricoId={loadingHistoricoId}
        historicoPorCliente={historicoPorCliente}
        onClose={() => setSelectedCliente(null)}
        onCall={handleCallTelphone}
        onWhatsapp={handleWhatsAppWindow}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getAtividadeIcon={getAtividadeIcon}
        getAtividadeColor={getAtividadeColor}
        loadHistoricoPage={loadHistoricoPageLocal}
      />
    </div>
  );
}
