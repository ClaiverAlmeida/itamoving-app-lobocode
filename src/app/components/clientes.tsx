import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { clientsService } from "../services/clients.service";

type ViewMode = "grid" | "list";

interface ClienteAtividade {
  id: string;
  tipo: "cadastro" | "agendamento" | "container" | "atualizacao";
  descricao: string;
  data: Date;
}

export default function ClientesView() {
  const { clientes, setClientes, addCliente, updateCliente, deleteCliente } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: "",
    atendente: "",
    periodo: "todos" as "todos" | "semana" | "mes" | "ano",
  });

  useEffect(() => {
    const carregarClientes = async () => {
      const response = await clientsService.getAll();
      if (response.success && response.data?.data) {
        setClientes(response.data.data);
      } else if (response.error) {
        toast.error(response.error);
      }
    };
    carregarClientes();
  }, [setClientes]);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefoneUSA: "",
    ruaUSA: "",
    numeroUSA: "",
    cidadeUSA: "",
    estadoUSA: "",
    zipCode: "",
    complementoUSA: "",
    nomeRecebedor: "",
    cpfRecebedor: "",
    enderecoBrasil: "",
    cidadeBrasil: "",
    estadoBrasil: "",
    cep: "",
    telefoneBrasil: "",
    atendente: "",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      telefoneUSA: "",
      ruaUSA: "",
      numeroUSA: "",
      cidadeUSA: "",
      estadoUSA: "",
      zipCode: "",
      complementoUSA: "",
      nomeRecebedor: "",
      cpfRecebedor: "",
      enderecoBrasil: "",
      cidadeBrasil: "",
      estadoBrasil: "",
      cep: "",
      telefoneBrasil: "",
      atendente: "",
    });
    setEditingCliente(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefoneUSA: cliente.telefoneUSA,
      ruaUSA: cliente.enderecoUSA.rua,
      numeroUSA: cliente.enderecoUSA.numero,
      cidadeUSA: cliente.enderecoUSA.cidade,
      estadoUSA: cliente.enderecoUSA.estado,
      zipCode: cliente.enderecoUSA.zipCode,
      complementoUSA: cliente.enderecoUSA.complemento || "",
      nomeRecebedor: cliente.destinoBrasil.nomeRecebedor,
      cpfRecebedor: cliente.destinoBrasil.cpfRecebedor,
      enderecoBrasil: cliente.destinoBrasil.endereco,
      cidadeBrasil: cliente.destinoBrasil.cidade,
      estadoBrasil: cliente.destinoBrasil.estado,
      cep: cliente.destinoBrasil.cep,
      telefoneBrasil: cliente.destinoBrasil.telefones[0] || "",
      atendente: cliente.atendente,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clienteData: Cliente = {
      id: editingCliente?.id || Date.now().toString(),
      nome: formData.nome,
      cpf: formData.cpf,
      telefoneUSA: formData.telefoneUSA,
      enderecoUSA: {
        rua: formData.ruaUSA,
        numero: formData.numeroUSA,
        cidade: formData.cidadeUSA,
        estado: formData.estadoUSA,
        zipCode: formData.zipCode,
        complemento: formData.complementoUSA,
      },
      destinoBrasil: {
        nomeRecebedor: formData.nomeRecebedor,
        cpfRecebedor: formData.cpfRecebedor,
        endereco: formData.enderecoBrasil,
        cidade: formData.cidadeBrasil,
        estado: formData.estadoBrasil,
        cep: formData.cep,
        telefones: [formData.telefoneBrasil],
      },
      atendente: formData.atendente,
      dataCadastro:
        editingCliente?.dataCadastro || new Date().toISOString().split("T")[0],
      status: "ativo",
    };

    if (editingCliente) {
      updateCliente(editingCliente.id, clienteData);
      toast.success("Cliente atualizado com sucesso!");
      if (selectedCliente?.id === editingCliente.id) {
        setSelectedCliente(clienteData);
      }
    } else {
      console.log(clienteData);
      addCliente(clienteData);
      toast.success("Cliente cadastrado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      deleteCliente(id);
      toast.success("Cliente excluído com sucesso!");
      if (selectedCliente?.id === id) {
        setSelectedCliente(null);
      }
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      // Search
      const matchesSearch =
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cpf.includes(searchTerm) ||
        cliente.telefoneUSA.includes(searchTerm) ||
        cliente.enderecoUSA.cidade
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cliente.destinoBrasil.cidade
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Estado
      if (
        filters.estado &&
        !cliente.enderecoUSA.estado
          .toLowerCase()
          .includes(filters.estado.toLowerCase())
      ) {
        return false;
      }

      // Atendente
      if (
        filters.atendente &&
        !cliente.atendente
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
    const total = filteredClientes.length;
    const novosUltimaSemana = filteredClientes.filter((c) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(c.dataCadastro) >= weekAgo;
    }).length;

    const estadosUnicos = new Set(
      filteredClientes.map((c) => c.enderecoUSA.estado),
    ).size;
    const cidadesBrasilUnicas = new Set(
      filteredClientes.map((c) => c.destinoBrasil.cidade),
    ).size;

    return { total, novosUltimaSemana, estadosUnicos, cidadesBrasilUnicas };
  }, [filteredClientes]);

  // Mock de atividades do cliente (em produção viria do backend)
  const getClienteAtividades = (clienteId: string): ClienteAtividade[] => {
    return [
      {
        id: "1",
        tipo: "cadastro",
        descricao: "Cliente cadastrado no sistema",
        data: new Date(selectedCliente?.dataCadastro || Date.now()),
      },
      {
        id: "2",
        tipo: "agendamento",
        descricao: "Agendamento de coleta confirmado",
        data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "3",
        tipo: "container",
        descricao: "Container #12345 em preparação",
        data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];
  };

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
    }
  };

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
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
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
                        <Label htmlFor="nome">Nome Completo *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) =>
                            setFormData({ ...formData, cpf: e.target.value })
                          }
                          placeholder="123.456.789-00"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefoneUSA">Telefone USA *</Label>
                        <Input
                          id="telefoneUSA"
                          value={formData.telefoneUSA}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telefoneUSA: e.target.value,
                            })
                          }
                          placeholder="+1 (305) 555-0123"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="atendente">Atendente *</Label>
                        <Input
                          id="atendente"
                          value={formData.atendente}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              atendente: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="ruaUSA">Rua *</Label>
                        <Input
                          id="ruaUSA"
                          value={formData.ruaUSA}
                          onChange={(e) =>
                            setFormData({ ...formData, ruaUSA: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numeroUSA">Número *</Label>
                        <Input
                          id="numeroUSA"
                          value={formData.numeroUSA}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              numeroUSA: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cidadeUSA">Cidade *</Label>
                        <Input
                          id="cidadeUSA"
                          value={formData.cidadeUSA}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cidadeUSA: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estadoUSA">Estado *</Label>
                        <Input
                          id="estadoUSA"
                          value={formData.estadoUSA}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estadoUSA: e.target.value,
                            })
                          }
                          placeholder="FL"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              zipCode: e.target.value,
                            })
                          }
                          placeholder="33101"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complementoUSA">Complemento</Label>
                      <Input
                        id="complementoUSA"
                        value={formData.complementoUSA}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            complementoUSA: e.target.value,
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
                        <Label htmlFor="nomeRecebedor">Nome Recebedor *</Label>
                        <Input
                          id="nomeRecebedor"
                          value={formData.nomeRecebedor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomeRecebedor: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpfRecebedor">CPF Recebedor *</Label>
                        <Input
                          id="cpfRecebedor"
                          value={formData.cpfRecebedor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cpfRecebedor: e.target.value,
                            })
                          }
                          placeholder="987.654.321-00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="enderecoBrasil">
                        Endereço Completo *
                      </Label>
                      <Input
                        id="enderecoBrasil"
                        value={formData.enderecoBrasil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            enderecoBrasil: e.target.value,
                          })
                        }
                        placeholder="Rua das Flores, 789, Apt 101"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cidadeBrasil">Cidade *</Label>
                        <Input
                          id="cidadeBrasil"
                          value={formData.cidadeBrasil}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cidadeBrasil: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estadoBrasil">Estado *</Label>
                        <Input
                          id="estadoBrasil"
                          value={formData.estadoBrasil}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estadoBrasil: e.target.value,
                            })
                          }
                          placeholder="SP"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) =>
                            setFormData({ ...formData, cep: e.target.value })
                          }
                          placeholder="01234-567"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefoneBrasil">Telefone Brasil *</Label>
                      <Input
                        id="telefoneBrasil"
                        value={formData.telefoneBrasil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            telefoneBrasil: e.target.value,
                          })
                        }
                        placeholder="+55 11 98765-4321"
                        required
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
                            {cliente.nome}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {cliente.atendente}
                            </Badge>
                            <Badge 
                              variant={cliente.status === 'ativo' ? 'secondary' : 'destructive'} 
                              className="text-xs"
                            >
                              {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{cliente.telefoneUSA}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {cliente.enderecoUSA.cidade},{" "}
                        {cliente.enderecoUSA.estado} →{" "}
                        {cliente.destinoBrasil.cidade},{" "}
                        {cliente.destinoBrasil.estado}
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
                          handleDelete(cliente.id, cliente.nome);
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
                                  {cliente.nome}
                                </h3>
                                <Badge variant="outline">
                                  {cliente.atendente}
                                </Badge>
                                <Badge 
                                  variant={cliente.status === 'ativo' ? 'secondary' : 'destructive'}
                                >
                                  {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    Informações
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {cliente.cpf}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {cliente.telefoneUSA}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    Origem (USA)
                                  </p>
                                  <p className="flex items-start gap-1">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>
                                      {cliente.enderecoUSA.cidade},{" "}
                                      {cliente.enderecoUSA.estado}{" "}
                                      {cliente.enderecoUSA.zipCode}
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
                                      {cliente.destinoBrasil.cidade},{" "}
                                      {cliente.destinoBrasil.estado}
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {cliente.destinoBrasil.nomeRecebedor}
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
                                handleDelete(cliente.id, cliente.nome);
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
                      {selectedCliente.nome}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700">
                        {selectedCliente.atendente}
                      </Badge>
                      <Badge 
                        className={
                          selectedCliente.status === 'ativo' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {selectedCliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
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
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
                <Button variant="outline" className="w-full">
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
                    <p className="text-sm text-muted-foreground mb-1">CPF</p>
                    <p className="font-semibold">{selectedCliente.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Telefone USA
                    </p>
                    <p className="font-semibold">
                      {selectedCliente.telefoneUSA}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Telefone Brasil
                    </p>
                    <p className="font-semibold">
                      {selectedCliente.destinoBrasil.telefones[0]}
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
                    {selectedCliente.enderecoUSA.rua},{" "}
                    {selectedCliente.enderecoUSA.numero}
                    {selectedCliente.enderecoUSA.complemento &&
                      `, ${selectedCliente.enderecoUSA.complemento}`}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedCliente.enderecoUSA.cidade},{" "}
                    {selectedCliente.enderecoUSA.estado}{" "}
                    {selectedCliente.enderecoUSA.zipCode}
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
                      {selectedCliente.destinoBrasil.nomeRecebedor}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      CPF do Recebedor
                    </p>
                    <p className="font-semibold">
                      {selectedCliente.destinoBrasil.cpfRecebedor}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Endereço
                    </p>
                    <p className="font-semibold">
                      {selectedCliente.destinoBrasil.endereco}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedCliente.destinoBrasil.cidade},{" "}
                      {selectedCliente.destinoBrasil.estado} - CEP:{" "}
                      {selectedCliente.destinoBrasil.cep}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Histórico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getClienteAtividades(selectedCliente.id).map(
                      (atividade) => {
                        const Icon = getAtividadeIcon(atividade.tipo);
                        const color = getAtividadeColor(atividade.tipo);

                        return (
                          <div
                            key={atividade.id}
                            className="flex items-start gap-3"
                          >
                            <div
                              className={`p-2 rounded-full ${
                                color === "blue"
                                  ? "bg-blue-100"
                                  : color === "green"
                                    ? "bg-green-100"
                                    : color === "purple"
                                      ? "bg-purple-100"
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
                                        : "text-orange-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                {atividade.descricao}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {atividade.data.toLocaleDateString("pt-BR")} às{" "}
                                {atividade.data.toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
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
                      handleDelete(selectedCliente.id, selectedCliente.nome)
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
