import React, { useState, useMemo, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useData } from "../context/DataContext";
import { Cliente } from "../types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  MapPin,
  Phone,
  Mail,
  Filter,
  Download,
  LayoutGrid,
  List,
  X,
  Calendar,
  Building,
  Flag,
  Users as UsersIcon,
  TrendingUp,
  Clock,
  Package,
  FileText,
  MessageCircle,
  Star,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  formatNumberTelephoneBrasil,
  formatNumberTelephoneEUA,
  formatCPF,
  BRASIL_STATES,
  EUA_STATES,
  exportDocument,
} from "../utils";
import {
  clientsService,
  type CreateClientsDTO,
  type UpdateClientsDTO,
  type ClientHistoryItem,
} from "../services/clients.service";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AtendenteSelect } from "./forms";

const HISTORY_PAGE_SIZE = 5;

interface HistoricoPaginado {
  items: ClienteAtividade[];
  total: number;
  page: number;
  totalPages: number;
}

type ViewMode = "grid" | "list";

interface ClienteAtividade {
  id: string;
  tipo: "cadastro" | "agendamento" | "container" | "atualizacao" | "exclusao";
  descricao: string;
  owner: {
    id: string;
    name: string;
  };
  data: Date;
}

export default function ClientesView() {
  const { user } = useAuth();
  const { clientes, setClientes, addCliente, updateCliente, deleteCliente } =
    useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  /** Histórico de atividades por cliente (paginado, 7 por página) */
  const [historicoPorCliente, setHistoricoPorCliente] = useState<
    Record<string, HistoricoPaginado>
  >({});
  const [loadingHistoricoId, setLoadingHistoricoId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [filters, setFilters] = useState({
    estado: "",
    atendente: "",
    periodo: "todos" as "todos" | "semana" | "mes" | "ano",
  });

  useEffect(() => {
    const carregarClientes = async () => {
      const result = await clientsService.getAll();
      if (result.success && result.data?.data) {
        setClientes(result.data.data);
      } else if (result.error) {
        toast.error(result.error);
      }
    };
    carregarClientes();
  }, [setClientes]);

  /** Mapeia item do backend para ClienteAtividade (tipo do painel) */
  const mapHistoryToAtividade = (item: ClientHistoryItem): ClienteAtividade => {
    const entityType = (item.entityType ?? "").toLowerCase();
    const actionType = (item.actionType ?? "").toLowerCase();
    let tipo: ClienteAtividade["tipo"] = "atualizacao";
    if (entityType === "client" && actionType === "created") tipo = "cadastro";
    else if (entityType === "client" && actionType === "updated")
      tipo = "atualizacao";
    else if (entityType === "client" && actionType === "deleted")
      tipo = "exclusao";
    else if (entityType === "appointment" || entityType === "agendamento")
      tipo = "agendamento";
    else if (entityType === "container") tipo = "container";
    return {
      id: item.id,
      tipo,
      owner: item.owner,
      descricao: item.message,
      data: new Date(item.createdAt),
    };
  };

  /** Carrega uma página do histórico do cliente */
  const loadHistoricoPage = (clientId: string, page: number) => {
    setLoadingHistoricoId(clientId);
    clientsService
      .history(clientId, page, HISTORY_PAGE_SIZE)
      .then((res) => {
        if (res.success && res.data) {
          const { data, total, page: p, totalPages } = res.data;
          setHistoricoPorCliente((prev) => ({
            ...prev,
            [clientId]: {
              items: data.map(mapHistoryToAtividade),
              total,
              page: p,
              totalPages,
            },
          }));
        }
      })
      .finally(() => setLoadingHistoricoId(null));
  };

  /** Ao abrir o painel, carrega a página 1 do histórico se ainda não tiver */
  useEffect(() => {
    if (!selectedCliente?.id) return;
    const clientId = selectedCliente.id;
    if (historicoPorCliente[clientId]) return; // já tem dados (qualquer página)

    loadHistoricoPage(clientId, 1);
  }, [selectedCliente?.id]);

  const [formData, setFormData] = useState({
    usaName: "",
    usaCpf: "",
    usaPhone: "",
    usaAddress: {
      rua: "",
      numero: "",
      cidade: "",
      estado: "",
      zipCode: "",
      complemento: "",
    },
    brazilName: "",
    brazilCpf: "",
    brazilPhone: "",
    brazilAddress: {
      rua: "",
      numero: "",
      cidade: "",
      estado: "",
      cep: "",
      complemento: "",
    },
    userId: "",
    status: "ACTIVE",
  });

  const resetForm = () => {
    setFormData({
      usaName: "",
      usaCpf: "",
      usaPhone: "",
      usaAddress: {
        rua: "",
        numero: "",
        cidade: "",
        estado: "",
        zipCode: "",
        complemento: "",
      },
      brazilName: "",
      brazilCpf: "",
      brazilPhone: "",
      brazilAddress: {
        rua: "",
        numero: "",
        cidade: "",
        estado: "",
        cep: "",
        complemento: "",
      },
      userId: "",
      status: "ACTIVE",
    });
    setEditingCliente(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    const usaAddr = cliente.usaAddress as {
      rua?: string;
      numero?: string;
      cidade?: string;
      estado?: string;
      zipCode?: string;
      complemento?: string;
    };
    const brAddr = cliente.brazilAddress as {
      rua?: string;
      numero?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      complemento?: string;
    };
    setFormData({
      usaName: cliente.usaNome ?? "",
      usaCpf: cliente.usaCpf ?? "",
      usaPhone: cliente.usaPhone ?? "",
      usaAddress: {
        rua: usaAddr?.rua ?? "",
        numero: usaAddr?.numero ?? "",
        cidade: usaAddr?.cidade ?? "",
        estado: usaAddr?.estado ?? "",
        zipCode: usaAddr?.zipCode ?? "",
        complemento: usaAddr?.complemento ?? "",
      },
      brazilName: cliente.brazilNome ?? "",
      brazilCpf: cliente.brazilCpf ?? "",
      brazilPhone: cliente.brazilPhone ?? "",
      brazilAddress: {
        rua: brAddr?.rua ?? "",
        numero: brAddr?.numero ?? "",
        cidade: brAddr?.cidade ?? "",
        estado: brAddr?.estado ?? "",
        cep: brAddr?.cep ?? "",
        complemento: brAddr?.complemento ?? "",
      },
      userId: cliente.user?.id ?? "",
      status: cliente.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    });
    setIsDialogOpen(true);
  };

  /** Monta o payload no formato do backend para criar cliente (strings trimadas; CPFs opcionais enviados só quando preenchidos) */
  const getCreatePayload = (): CreateClientsDTO => {
    const trim = (s: string) => (s ?? "").trim();
    const payload: CreateClientsDTO = {
      usaName: trim(formData.usaName),
      usaCpf: trim(formData.usaCpf) || "",
      usaPhone: trim(formData.usaPhone),
      usaAddress: {
        rua: trim(formData.usaAddress.rua),
        numero: trim(formData.usaAddress.numero),
        cidade: trim(formData.usaAddress.cidade),
        estado: trim(formData.usaAddress.estado),
        zipCode: trim(formData.usaAddress.zipCode),
        complemento: trim(formData.usaAddress.complemento) || "",
      },
      brazilName: trim(formData.brazilName),
      brazilCpf: trim(formData.brazilCpf) || "",
      brazilPhone: trim(formData.brazilPhone),
      brazilAddress: {
        rua: trim(formData.brazilAddress.rua),
        numero: trim(formData.brazilAddress.numero),
        cidade: trim(formData.brazilAddress.cidade),
        estado: trim(formData.brazilAddress.estado),
        cep: trim(formData.brazilAddress.cep),
        complemento: trim(formData.brazilAddress.complemento) || "",
      },
      userId: trim(formData.userId),
      status: formData.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    };
    return payload;
  };

  /** Formata CEP brasileiro como 00000-000 (apenas dígitos, até 8). */
  const formatCepBrasil = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return digits.replace(/(\d{5})(\d{0,3})/, (_, a, b) =>
      b ? `${a}-${b}` : a,
    );
  };

  /** Busca endereço pelo CEP brasileiro (ViaCEP). Preenche Endereço, Cidade e Estado (UF validado pela chave). Usado em criar e editar. */
  /** Busca endereço pelo CEP (ViaCEP) e preenche rua, cidade, estado e mantém o CEP informado. */
  const handleCepBrasilChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    const cepFormatado = cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2");
    setLoadingCep(true);
    try {
      const result = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await result.json();

      if (!data.erro) {
        const uf = (data.uf || "").trim().toUpperCase();
        const estadoValido = BRASIL_STATES.some((e) => e.uf === uf) ? uf : "";
        const cepExibir =
          data.cep && String(data.cep).trim()
            ? String(data.cep)
                .replace(/\D/g, "")
                .replace(/(\d{5})(\d{3})/, "$1-$2")
            : cepFormatado;

        setFormData((prev) => ({
          ...prev,
          brazilAddress: {
            ...prev.brazilAddress,
            rua: data.logradouro || "",
            cidade: data.localidade || "",
            estado: estadoValido,
            cep: cepExibir,
          },
        }));
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado");
        setFormData((prev) => ({
          ...prev,
          brazilAddress: {
            ...prev.brazilAddress,
            cep: cepFormatado,
          },
        }));
      }
    } catch {
      toast.error("Erro ao buscar CEP");
      setFormData((prev) => ({
        ...prev,
        brazilAddress: {
          ...prev.brazilAddress,
          cep: cepFormatado,
        },
      }));
    } finally {
      setLoadingCep(false);
    }
  };

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
    const result = await clientsService.create(payload);
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

  /** Monta payload de edição no formato do backend (apenas campos alterados para PATCH) */
  const getUpdatePayload = (): UpdateClientsDTO => {
    const current: CreateClientsDTO = {
      usaName: formData.usaName,
      usaCpf: formData.usaCpf,
      usaPhone: formData.usaPhone,
      usaAddress: formData.usaAddress,
      brazilName: formData.brazilName,
      brazilCpf: formData.brazilCpf,
      brazilPhone: formData.brazilPhone,
      brazilAddress: formData.brazilAddress,
      userId: formData.userId,
      status: formData.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    };

    const original = editingCliente!;
    const origUsaAddr = original.usaAddress as {
      rua?: string;
      numero?: string;
      cidade?: string;
      estado?: string;
      zipCode?: string;
      complemento?: string;
    };
    const origBrAddr = original.brazilAddress as {
      rua?: string;
      numero?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      complemento?: string;
    };
    const patch: UpdateClientsDTO = {};

    if (current.usaName !== original.usaNome) patch.usaName = current.usaName;
    if (current.usaCpf !== original.usaCpf) patch.usaCpf = current.usaCpf;
    if (current.usaPhone !== original.usaPhone)
      patch.usaPhone = current.usaPhone;
    if (current.brazilName !== original.brazilNome)
      patch.brazilName = current.brazilName;
    if (current.brazilCpf !== original.brazilCpf)
      patch.brazilCpf = current.brazilCpf;
    if (current.brazilPhone !== original.brazilPhone)
      patch.brazilPhone = current.brazilPhone;
    if (current.userId !== (original.user?.id ?? ""))
      patch.userId = current.userId;
    if (
      current.status !== (original.status === "ACTIVE" ? "ACTIVE" : "INACTIVE")
    )
      patch.status = current.status;

    const usaAddressChanged =
      current.usaAddress.rua !== (origUsaAddr?.rua ?? "") ||
      current.usaAddress.numero !== (origUsaAddr?.numero ?? "") ||
      current.usaAddress.cidade !== (origUsaAddr?.cidade ?? "") ||
      current.usaAddress.estado !== (origUsaAddr?.estado ?? "") ||
      current.usaAddress.zipCode !== (origUsaAddr?.zipCode ?? "") ||
      (current.usaAddress.complemento ?? "") !==
        (origUsaAddr?.complemento ?? "");
    if (usaAddressChanged) patch.usaAddress = current.usaAddress;

    const brazilDestChanged =
      current.brazilAddress.rua !== (origBrAddr?.rua ?? "") ||
      current.brazilAddress.numero !== (origBrAddr?.numero ?? "") ||
      current.brazilAddress.cidade !== (origBrAddr?.cidade ?? "") ||
      current.brazilAddress.estado !== (origBrAddr?.estado ?? "") ||
      current.brazilAddress.cep !== (origBrAddr?.cep ?? "");
    if (brazilDestChanged) patch.brazilAddress = current.brazilAddress;

    return patch;
  };

  const handleUpdate = async () => {
    const patchPayload = getUpdatePayload();
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

    const result = await clientsService.update(
      editingCliente!.id,
      patchPayload,
      payloadBeforeAfter,
    );

    if (!result.success) {
      toast.error(result.error || "Erro ao atualizar cliente");
      return;
    }

    const clienteData: Cliente = {
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
    loadHistoricoPage(editingCliente!.id, 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCliente) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    const confirm = window.confirm(
      `Tem certeza que deseja excluir o cliente ${nome}?`,
    );

    if (confirm) {
      const result = await clientsService.delete(id);
      if (result.success) {
        deleteCliente(id);
        toast.success("Cliente excluído com sucesso!");
        if (selectedCliente?.id === id) {
          setSelectedCliente(null);
        }
      } else {
        toast.error(result.error || "Erro ao excluir cliente");
      }
    }
  };

  const handleExport = async () => {
    const result = await clientsService.export();

    if (result.success && result.data) {
      if (!result.data.length) {
        toast.error("Nenhum cliente cadastrado");
        return;
      }
    }

    // exportDocument.createPdf(result.data, "Clients", "Clients list");
    toast.success("Clientes exportados com sucesso");
    console.log(result.data);
    //TODO: Implementar a exportação de clientes
  };

  const handleCallTelphone = (telefones: string[]) => {
    if (!telefones || telefones.length === 0) {
      toast.error("Nenhum telefone encontrado");
      return;
    }

    const telefone = telefones[0];
    window.open(`tel:${telefone}`, "_blank");
  };

  const handleWhatsAppWindow = (telefones: string[]) => {
    if (!telefones || telefones.length === 0) {
      toast.error("Nenhum telefone encontrado");
      return;
    }

    const telefone = telefones[0].trim().replace(/\D/g, "");
    window.open(`https://api.whatsapp.com/send?phone=${telefone}`, "_blank");
  };

  // TODO
  // Documentos do Cliente

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

  const getAtividadeIcon = (tipo: ClienteAtividade["tipo"]) => {
    switch (tipo) {
      case "cadastro":
        return User;
      case "agendamento":
        return Calendar;
      case "container":
        return Package;
      case "atualizacao":
        return Edit;
      case "exclusao":
        return Trash2;
    }
  };

  const getAtividadeColor = (tipo: ClienteAtividade["tipo"]) => {
    switch (tipo) {
      case "cadastro":
        return "blue";
      case "agendamento":
        return "green";
      case "container":
        return "purple";
      case "atualizacao":
        return "orange";
      case "exclusao":
        return "red";
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
  const fieldLabel: Record<string, string> = {
    usaName: "Nome (USA)",
    usaCpf: "CPF (USA)",
    usaPhone: "Telefone EUA",
    usaAddress: "Endereço EUA",
    brazilName: "Nome Recebedor (Brasil)",
    brazilCpf: "CPF Recebedor (Brasil)",
    brazilPhone: "Telefone Brasil",
    brazilAddress: "Endereço Brasil",
    userId: "Atendente",
    status: "Status",
  };
  const getFieldLabel = (key: string) => fieldLabel[key] ?? key;

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
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCliente ? "Editar Cliente" : "Novo Cliente"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do cliente e do destino no Brasil
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                      <Flag className="w-5 h-5 text-blue-600" />
                      Dados do Cliente (USA)
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usaName">Nome Completo (USA) *</Label>
                        <Input
                          id="usaName"
                          value={formData.usaName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="usaCpf">CPF (USA)</Label>
                        <Input
                          id="usaCpf"
                          value={formData.usaCpf}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaCpf: formatCPF(e.target.value),
                            })
                          }
                          placeholder="123.456.789-00"
                          maxLength={14}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="usaPhone">Telefone USA *</Label>
                        <Input
                          id="usaPhone"
                          value={formData.usaPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaPhone: formatNumberTelephoneEUA(
                                e.target.value,
                              ),
                            })
                          }
                          placeholder="+1 (305) 555-0123"
                          required
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
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="ruaUSA">Rua (USA) *</Label>
                        <Input
                          id="ruaUSA"
                          value={formData.usaAddress.rua}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaAddress: {
                                ...formData.usaAddress,
                                rua: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numeroUSA">Número (USA) *</Label>
                        <Input
                          id="numeroUSA"
                          value={formData.usaAddress.numero}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaAddress: {
                                ...formData.usaAddress,
                                numero: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cidadeUSA">Cidade (USA) *</Label>
                        <Input
                          id="cidadeUSA"
                          value={formData.usaAddress.cidade}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaAddress: {
                                ...formData.usaAddress,
                                cidade: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estadoUSA">Estado (USA) *</Label>
                        <Select
                          value={formData.usaAddress.estado || undefined}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              usaAddress: {
                                ...formData.usaAddress,
                                estado: value,
                              },
                            })
                          }
                          required
                        >
                          <SelectTrigger id="estadoUSA">
                            <SelectValue placeholder="Selecione o estado dos EUA" />
                          </SelectTrigger>
                          <SelectContent>
                            {EUA_STATES.map(({ uf, nome }) => (
                              <SelectItem key={uf} value={uf}>
                                {uf} – {nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.usaAddress.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              usaAddress: {
                                ...formData.usaAddress,
                                zipCode: e.target.value,
                              },
                            })
                          }
                          placeholder="33101"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complementoUSA">Complemento (USA)</Label>
                      <Input
                        id="complementoUSA"
                        value={formData.usaAddress.complemento}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            usaAddress: {
                              ...formData.usaAddress,
                              complemento: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                      <Flag className="w-5 h-5 text-green-600" />
                      Destinatário no Brasil
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brazilName">
                          Nome Recebedor (Brasil) *
                        </Label>
                        <Input
                          id="brazilName"
                          value={formData.brazilName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brazilName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brazilCpf">
                          CPF Recebedor (Brasil)
                        </Label>
                        <Input
                          id="brazilCpf"
                          value={formData.brazilCpf}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brazilCpf: formatCPF(e.target.value),
                            })
                          }
                          placeholder="987.654.321-00"
                          maxLength={14}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="ruaBrasil">Rua (Brasil) *</Label>
                        <Input
                          id="ruaBrasil"
                          value={formData.brazilAddress.rua}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brazilAddress: {
                                ...formData.brazilAddress,
                                rua: e.target.value,
                              },
                            })
                          }
                          placeholder="Rua das Flores"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroBrasil">Número (Brasil) *</Label>
                        <Input
                          id="numeroBrasil"
                          value={formData.brazilAddress.numero}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brazilAddress: {
                                ...formData.brazilAddress,
                                numero: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cidadeBrasil">Cidade (Brasil) *</Label>
                        <Input
                          id="cidadeBrasil"
                          value={formData.brazilAddress.cidade}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brazilAddress: {
                                ...formData.brazilAddress,
                                cidade: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estadoBrasil">Estado (Brasil) *</Label>
                        <Select
                          value={formData.brazilAddress.estado || undefined}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              brazilAddress: {
                                ...formData.brazilAddress,
                                estado: value,
                              },
                            })
                          }
                          required
                        >
                          <SelectTrigger id="estadoBrasil">
                            <SelectValue placeholder="Selecione o estado do Brasil" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRASIL_STATES.map(({ uf, nome }) => (
                              <SelectItem key={uf} value={uf}>
                                {uf} – {nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP Brasil *</Label>
                        <Input
                          id="cep"
                          value={formData.brazilAddress.cep}
                          onChange={(e) => {
                            const formatted = formatCepBrasil(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              brazilAddress: {
                                ...prev.brazilAddress,
                                cep: formatted,
                              },
                            }));
                            if (formatted.replace(/\D/g, "").length === 8) {
                              handleCepBrasilChange(formatted);
                            }
                          }}
                          placeholder="01234-567"
                          maxLength={9}
                          required
                          disabled={loadingCep}
                        />
                        {loadingCep && (
                          <p className="text-xs text-muted-foreground">
                            Buscando endereço...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brazilPhone">Telefone Brasil *</Label>
                      <Input
                        id="brazilPhone"
                        value={formData.brazilPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brazilPhone: formatNumberTelephoneBrasil(
                              e.target.value,
                            ),
                          })
                        }
                        placeholder="+55 11 98765-4321"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complementoBrasil">
                        Complemento (Brasil)
                      </Label>
                      <Input
                        id="complementoBrasil"
                        value={formData.brazilAddress.complemento}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brazilAddress: {
                              ...formData.brazilAddress,
                              complemento: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="cliente-ativo">Cliente ativo</Label>
                        <p className="text-xs text-muted-foreground">
                          O cliente será ativo se o switch estiver ligado.
                        </p>
                      </div>
                      <Switch
                        id="cliente-ativo"
                        checked={formData.status === "ACTIVE"}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: checked ? "ACTIVE" : "INACTIVE",
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
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
                    <Button type="submit">
                      {editingCliente ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-blue-900">
                Total de Clientes
              </span>
              <UsersIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-900">
              {statistics.total}
            </p>
            <p className="text-xs text-blue-700 mt-1">Cadastros ativos</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-green-900">
                Novos (7 dias)
              </span>
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-900">
              {statistics.novosUltimaSemana}
            </p>
            <p className="text-xs text-green-700 mt-1">Última semana</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-purple-900">
                Estados (USA)
              </span>
              <Building className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-purple-900">
              {statistics.estadosUnicos}
            </p>
            <p className="text-xs text-purple-700 mt-1">Localizações únicas</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-orange-900">
                Cidades (BR)
              </span>
              <Flag className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-orange-900">
              {statistics.cidadesBrasilUnicas}
            </p>
            <p className="text-xs text-orange-700 mt-1">Destinos no Brasil</p>
          </Card>
        </div>

        {/* Barra de Busca e View Mode */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, telefone ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
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

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredClientes.map((cliente) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 group"
                  onClick={() => setSelectedCliente(cliente)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">
                            {cliente.usaNome}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {cliente.user?.name ?? "—"}
                            </Badge>
                            <Badge
                              variant={
                                cliente.status === "ACTIVE"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {cliente.status === "ACTIVE"
                                ? "Ativo"
                                : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{cliente.usaPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {
                          (
                            cliente.usaAddress as {
                              cidade?: string;
                              estado?: string;
                            }
                          ).cidade
                        }
                        , {(cliente.usaAddress as { estado?: string }).estado} →{" "}
                        {
                          (
                            cliente.brazilAddress as {
                              cidade?: string;
                              estado?: string;
                            }
                          ).cidade
                        }
                        ,{" "}
                        {(cliente.brazilAddress as { estado?: string }).estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Cadastrado em{" "}
                        {new Date(cliente.dataCadastro).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(cliente);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cliente.id, cliente.usaNome);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredClientes.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredClientes.length} cliente(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {filteredClientes.map((cliente) => (
                  <motion.div
                    key={cliente.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group"
                  >
                    <Card
                      className="hover:shadow-md transition-all cursor-pointer border-l-4 border-blue-500"
                      onClick={() => setSelectedCliente(cliente)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">
                                  {cliente.usaNome}
                                </h3>
                                <Badge variant="outline">
                                  {cliente.user?.name ?? "—"}
                                </Badge>
                                <Badge
                                  variant={
                                    cliente.status === "ACTIVE"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {cliente.status === "ACTIVE"
                                    ? "Ativo"
                                    : "Inativo"}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    Informações
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {cliente.usaCpf}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {cliente.usaPhone}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    Origem (USA)
                                  </p>
                                  <p className="flex items-start gap-1">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>
                                      {
                                        (
                                          cliente.usaAddress as {
                                            cidade?: string;
                                            estado?: string;
                                            zipCode?: string;
                                          }
                                        ).cidade
                                      }
                                      ,{" "}
                                      {
                                        (
                                          cliente.usaAddress as {
                                            estado?: string;
                                          }
                                        ).estado
                                      }{" "}
                                      {
                                        (
                                          cliente.usaAddress as {
                                            zipCode?: string;
                                          }
                                        ).zipCode
                                      }
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    Destino (Brasil)
                                  </p>
                                  <p className="flex items-start gap-1">
                                    <Flag className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>
                                      {
                                        (
                                          cliente.brazilAddress as {
                                            cidade?: string;
                                            estado?: string;
                                          }
                                        ).cidade
                                      }
                                      ,{" "}
                                      {
                                        (
                                          cliente.brazilAddress as {
                                            estado?: string;
                                          }
                                        ).estado
                                      }
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {cliente.brazilNome}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(cliente);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(cliente.id, cliente.usaNome);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredClientes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Painel Lateral - Perfil do Cliente */}
      <AnimatePresence>
        {selectedCliente && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-border p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-500 p-4 rounded-full">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedCliente.usaNome}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700">
                        {selectedCliente.user?.name ?? "—"}
                      </Badge>
                      <Badge
                        className={
                          selectedCliente.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {selectedCliente.status === "ACTIVE"
                          ? "Ativo"
                          : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        Cliente desde{" "}
                        {new Date(
                          selectedCliente.dataCadastro,
                        ).toLocaleDateString("pt-BR")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCliente(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Ações Rápidas */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    handleCallTelphone(
                      selectedCliente.brazilPhone
                        ? [selectedCliente.brazilPhone]
                        : [],
                    )
                  }
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    handleWhatsAppWindow(
                      selectedCliente.brazilPhone
                        ? [selectedCliente.brazilPhone]
                        : [],
                    )
                  }
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleEdit(selectedCliente)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentos
                </Button>
              </div>

              {/* Informações de Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      CPF (USA)
                    </p>
                    <p className="font-semibold">{selectedCliente.usaCpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Telefone USA
                    </p>
                    <p className="font-semibold">{selectedCliente.usaPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Telefone Brasil
                    </p>
                    <p className="font-semibold">
                      {selectedCliente.brazilPhone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço USA */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flag className="w-5 h-5 text-blue-600" />
                    Endereço nos Estados Unidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">
                    {
                      (
                        selectedCliente.usaAddress as {
                          rua?: string;
                          numero?: string;
                          complemento?: string;
                        }
                      ).rua
                    }
                    ,{" "}
                    {(selectedCliente.usaAddress as { numero?: string }).numero}
                    {(selectedCliente.usaAddress as { complemento?: string })
                      .complemento &&
                      `, ${(selectedCliente.usaAddress as { complemento?: string }).complemento}`}
                  </p>
                  <p className="text-muted-foreground">
                    {(selectedCliente.usaAddress as { cidade?: string }).cidade}
                    ,{" "}
                    {(selectedCliente.usaAddress as { estado?: string }).estado}{" "}
                    {
                      (selectedCliente.usaAddress as { zipCode?: string })
                        .zipCode
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Destinatário Brasil */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flag className="w-5 h-5 text-green-600" />
                    Destinatário no Brasil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Nome do Recebedor
                    </p>
                    <p className="font-semibold">
                      {selectedCliente.brazilNome}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      CPF do Recebedor
                    </p>
                    <p className="font-semibold">{selectedCliente.brazilCpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Endereço
                    </p>
                    <p className="font-semibold">
                      {(selectedCliente.brazilAddress as { rua?: string }).rua},{" "}
                      {
                        (selectedCliente.brazilAddress as { numero?: string })
                          .numero
                      }
                      {(
                        selectedCliente.brazilAddress as {
                          complemento?: string;
                        }
                      ).complemento &&
                        `, ${(selectedCliente.brazilAddress as { complemento?: string }).complemento}`}
                    </p>
                    <p className="text-muted-foreground">
                      {
                        (selectedCliente.brazilAddress as { cidade?: string })
                          .cidade
                      }
                      ,{" "}
                      {
                        (selectedCliente.brazilAddress as { estado?: string })
                          .estado
                      }{" "}
                      - CEP:{" "}
                      {(selectedCliente.brazilAddress as { cep?: string }).cep}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Atividades (paginado, 5 por página) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Histórico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingHistoricoId === selectedCliente.id ? (
                      <p className="text-sm text-muted-foreground">
                        Carregando histórico...
                      </p>
                    ) : !historicoPorCliente[selectedCliente.id] ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma atividade registrada.
                      </p>
                    ) : historicoPorCliente[selectedCliente.id].items.length ===
                      0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma atividade registrada.
                      </p>
                    ) : (
                      <>
                        {historicoPorCliente[selectedCliente.id].items.map(
                          (atividade) => {
                            const Icon = getAtividadeIcon(atividade.tipo);
                            const color = getAtividadeColor(atividade.tipo);
                            const linhaAtividade = (
                              <>
                                <div
                                  className={`p-2 rounded-full flex-shrink-0 ${
                                    color === "blue"
                                      ? "bg-blue-100"
                                      : color === "green"
                                        ? "bg-green-100"
                                        : color === "purple"
                                          ? "bg-purple-100"
                                          : color === "red"
                                            ? "bg-red-100"
                                            : "bg-orange-100"
                                  }`}
                                >
                                  <Icon
                                    className={`w-4 h-4 ${
                                      color === "blue"
                                        ? "text-blue-600"
                                        : color === "green"
                                          ? "text-green-600"
                                          : color === "purple"
                                            ? "text-purple-600"
                                            : color === "red"
                                              ? "text-red-600"
                                              : "text-orange-600"
                                    }`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <p className="font-semibold text-sm">
                                    {atividade.descricao}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {atividade.data.toLocaleDateString("pt-BR")}{" "}
                                    às{" "}
                                    {atividade.data.toLocaleTimeString(
                                      "pt-BR",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}{" "}
                                    -{" "}
                                    {atividade.tipo === "atualizacao"
                                      ? "Editado"
                                      : atividade.tipo === "cadastro"
                                        ? "Cadastrado"
                                        : atividade.tipo === "exclusao"
                                          ? "Excluído"
                                          : "Atualizado"}{" "}
                                    por: {atividade.owner.name}
                                  </p>
                                </div>
                              </>
                            );

                            return (
                              <div
                                key={atividade.id}
                                className="flex items-start gap-3"
                              >
                                {linhaAtividade}
                              </div>
                            );
                          },
                        )}
                        {historicoPorCliente[selectedCliente.id].totalPages >
                          1 && (
                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                loadingHistoricoId === selectedCliente.id ||
                                historicoPorCliente[selectedCliente.id].page <=
                                  1
                              }
                              onClick={() =>
                                loadHistoricoPage(
                                  selectedCliente.id,
                                  historicoPorCliente[selectedCliente.id].page -
                                    1,
                                )
                              }
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              Anterior
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Página{" "}
                              {historicoPorCliente[selectedCliente.id].page} de{" "}
                              {
                                historicoPorCliente[selectedCliente.id]
                                  .totalPages
                              }{" "}
                              ({historicoPorCliente[selectedCliente.id].total}{" "}
                              atividades)
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                loadingHistoricoId === selectedCliente.id ||
                                historicoPorCliente[selectedCliente.id].page >=
                                  historicoPorCliente[selectedCliente.id]
                                    .totalPages
                              }
                              onClick={() =>
                                loadHistoricoPage(
                                  selectedCliente.id,
                                  historicoPorCliente[selectedCliente.id].page +
                                    1,
                                )
                              }
                            >
                              Próxima
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Zona de Perigo */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-900">
                    Zona de Perigo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() =>
                      handleDelete(selectedCliente.id, selectedCliente.usaNome)
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Cliente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
