import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useData } from '../context/DataContext';
import { Container as ContainerType } from '../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
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
  XCircle
} from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'kanban';

interface ContainerEvento {
  id: string;
  tipo: 'preparacao' | 'embarque' | 'transito' | 'alfandega' | 'entrega';
  descricao: string;
  local: string;
  data: Date;
  concluido: boolean;
}

export default function ContainersView() {
  const { containers, addContainer, updateContainer, deleteContainer, clientes } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'todos' as 'todos' | 'preparacao' | 'transito' | 'entregue' | 'cancelado',
    origem: '',
    destino: '',
  });

  const [formData, setFormData] = useState({
    numero: '',
    tipo: '40ft' as '20ft' | '40ft' | '40ft HC' | '45ft HC',
    origem: 'Miami, FL - USA',
    destino: 'Santos, SP - Brasil',
    dataEmbarque: new Date().toISOString().split('T')[0],
    previsaoChegada: '',
    status: 'preparacao' as 'preparacao' | 'transito' | 'entregue' | 'cancelado',
    volume: '',
    limiteP: '',
    linkRastreamento: '',
  });

  const resetForm = () => {
    setFormData({
      numero: '',
      tipo: '40ft',
      origem: 'Miami, FL - USA',
      destino: 'Santos, SP - Brasil',
      dataEmbarque: new Date().toISOString().split('T')[0],
      previsaoChegada: '',
      status: 'preparacao',
      volume: '',
      limiteP: '',
      linkRastreamento: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novoContainer: ContainerType = {
      id: Date.now().toString(),
      numero: formData.numero,
      tipo: formData.tipo,
      origem: formData.origem,
      destino: formData.destino,
      dataEnvio: formData.dataEmbarque,
      dataEmbarque: formData.dataEmbarque,
      previsaoChegada: formData.previsaoChegada,
      status: formData.status,
      volume: parseFloat(formData.volume),
      linkRastreamento: formData.linkRastreamento,
      limiteP: parseFloat(formData.limiteP),
      pesoTotal: 0,
      caixas: [],
    };

    addContainer(novoContainer);
    toast.success('Container cadastrado com sucesso!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContainer) {
      toast.error('Nenhum container selecionado');
      return;
    }

    const containerAtualizado = {
      numero: formData.numero,
      tipo: formData.tipo,
      origem: formData.origem,
      destino: formData.destino,
      dataEnvio: formData.dataEmbarque,
      dataEmbarque: formData.dataEmbarque,
      previsaoChegada: formData.previsaoChegada,
      status: formData.status,
      volume: parseFloat(formData.volume),
      linkRastreamento: formData.linkRastreamento,
      limiteP: parseFloat(formData.limiteP),
    };

    updateContainer(selectedContainer.id, containerAtualizado);
    toast.success('Container atualizado com sucesso!');
    resetForm();
    setIsEditDialogOpen(false);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedContainer) {
      toast.error('Nenhum container selecionado');
      return;
    }

    deleteContainer(selectedContainer.id);
    toast.success('Container excluído com sucesso!');
    setSelectedContainer(null);
    setIsDeleteDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparacao': return { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-700' };
      case 'transito': return { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-700' };
      case 'entregue': return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', badge: 'bg-green-100 text-green-700' };
      case 'cancelado': return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900', badge: 'bg-red-100 text-red-700' };
      default: return { bg: 'bg-slate-50', border: 'border-slate-500', text: 'text-slate-900', badge: 'bg-slate-100 text-slate-700' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparacao': return Package;
      case 'transito': return Ship;
      case 'entregue': return CheckCircle2;
      case 'cancelado': return X;
      default: return ContainerIcon;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'preparacao': return 'Em Preparação';
      case 'transito': return 'Em Trânsito';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredContainers = useMemo(() => {
    return containers.filter(container => {
      // Search
      const matchesSearch = 
        container.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.destino.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status
      if (filters.status !== 'todos' && container.status !== filters.status) {
        return false;
      }

      // Origem
      if (filters.origem && !container.origem.toLowerCase().includes(filters.origem.toLowerCase())) {
        return false;
      }

      // Destino
      if (filters.destino && !container.destino.toLowerCase().includes(filters.destino.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [containers, searchTerm, filters]);

  const statistics = useMemo(() => {
    const total = filteredContainers.length;
    const emPreparacao = filteredContainers.filter(c => c.status === 'preparacao').length;
    const emTransito = filteredContainers.filter(c => c.status === 'transito').length;
    const entregues = filteredContainers.filter(c => c.status === 'entregue').length;
    const totalCaixas = filteredContainers.reduce((sum, c) => sum + c.caixas.length, 0);
    const pesoTotal = filteredContainers.reduce((sum, c) => sum + c.pesoTotal, 0);
    const capacidadeMedia = filteredContainers.length > 0 
      ? filteredContainers.reduce((sum, c) => sum + (c.pesoTotal / c.limiteP), 0) / filteredContainers.length * 100
      : 0;

    return { total, emPreparacao, emTransito, entregues, totalCaixas, pesoTotal, capacidadeMedia };
  }, [filteredContainers]);

  // Mock de eventos do container (em produção viria do backend)
  const getContainerEventos = (containerId: string): ContainerEvento[] => {
    return [
      {
        id: '1',
        tipo: 'preparacao',
        descricao: 'Container em preparação no armazém',
        local: 'Miami, FL - USA',
        data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        concluido: true,
      },
      {
        id: '2',
        tipo: 'embarque',
        descricao: 'Embarque no porto de origem',
        local: 'Port of Miami - USA',
        data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        concluido: true,
      },
      {
        id: '3',
        tipo: 'transito',
        descricao: 'Container em trânsito marítimo',
        local: 'Oceano Atlântico',
        data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        concluido: true,
      },
      {
        id: '4',
        tipo: 'alfandega',
        descricao: 'Liberação alfandegária',
        local: 'Santos, SP - Brasil',
        data: new Date(),
        concluido: selectedContainer?.status === 'entregue',
      },
      {
        id: '5',
        tipo: 'entrega',
        descricao: 'Entrega ao destinatário',
        local: selectedContainer?.destino || 'São Paulo, SP',
        data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        concluido: false,
      },
    ];
  };

  const getEventoIcon = (tipo: ContainerEvento['tipo']) => {
    switch (tipo) {
      case 'preparacao': return Package;
      case 'embarque': return Anchor;
      case 'transito': return Ship;
      case 'alfandega': return FileText;
      case 'entrega': return Truck;
    }
  };

  const containersByStatus = useMemo(() => {
    return {
      preparacao: filteredContainers.filter(c => c.status === 'preparacao'),
      transito: filteredContainers.filter(c => c.status === 'transito'),
      entregue: filteredContainers.filter(c => c.status === 'entregue'),
      cancelado: filteredContainers.filter(c => c.status === 'cancelado'),
    };
  }, [filteredContainers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Containers</h2>
            <p className="text-muted-foreground mt-1">
              Rastreamento e controle de containers internacionais
            </p>
          </div>
          <div className="flex gap-3">
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
                    Preencha os dados para registrar um novo container no sistema
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número do Container *</Label>
                      <Input
                        id="numero"
                        placeholder="Ex: MSKU1234567"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Container *</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20ft">20ft Standard</SelectItem>
                          <SelectItem value="40ft">40ft Standard</SelectItem>
                          <SelectItem value="40ft HC">40ft High Cube</SelectItem>
                          <SelectItem value="45ft HC">45ft High Cube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origem">Porto de Origem *</Label>
                      <Input
                        id="origem"
                        placeholder="Ex: Miami, FL - USA"
                        value={formData.origem}
                        onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destino">Porto de Destino *</Label>
                      <Input
                        id="destino"
                        placeholder="Ex: Santos, SP - Brasil"
                        value={formData.destino}
                        onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataEmbarque">Data de Embarque *</Label>
                      <Input
                        id="dataEmbarque"
                        type="date"
                        value={formData.dataEmbarque}
                        onChange={(e) => setFormData({ ...formData, dataEmbarque: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previsaoChegada">Previsão de Chegada *</Label>
                      <Input
                        id="previsaoChegada"
                        type="date"
                        value={formData.previsaoChegada}
                        onChange={(e) => setFormData({ ...formData, previsaoChegada: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume (m³) *</Label>
                      <Input
                        id="volume"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 67.5"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="limiteP">Limite de Peso (kg) *</Label>
                      <Input
                        id="limiteP"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 28000"
                        value={formData.limiteP}
                        onChange={(e) => setFormData({ ...formData, limiteP: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="linkRastreamento">Link de Rastreamento</Label>
                      <Input
                        id="linkRastreamento"
                        type="url"
                        placeholder="Ex: https://tracking.example.com/CNT123456"
                        value={formData.linkRastreamento}
                        onChange={(e) => setFormData({ ...formData, linkRastreamento: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL completa do sistema de rastreamento do container
                      </p>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="status">Status Inicial *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preparacao">Em Preparação</SelectItem>
                          <SelectItem value="transito">Em Trânsito</SelectItem>
                          <SelectItem value="entregue">Entregue</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
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
                    <Button type="submit">
                      Cadastrar Container
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant={showFilters ? 'default' : 'outline'}
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
        <div className="grid grid-cols-6 gap-4">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Total Containers</span>
              <ContainerIcon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{statistics.total}</p>
            <p className="text-xs text-blue-700 mt-1">Containers ativos</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-900">Em Preparação</span>
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-900">{statistics.emPreparacao}</p>
            <p className="text-xs text-yellow-700 mt-1">Sendo carregados</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Em Trânsito</span>
              <Ship className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{statistics.emTransito}</p>
            <p className="text-xs text-purple-700 mt-1">No oceano</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Entregues</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{statistics.entregues}</p>
            <p className="text-xs text-green-700 mt-1">Completos</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-900">Total Caixas</span>
              <Boxes className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-900">{statistics.totalCaixas}</p>
            <p className="text-xs text-orange-700 mt-1">Unidades</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-900">Peso Total</span>
              <Weight className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{statistics.pesoTotal.toFixed(0)}</p>
            <p className="text-xs text-slate-700 mt-1">Quilogramas</p>
          </Card>
        </div>

        {/* Barra de Busca e View Mode */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, origem ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Boxes className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Painel de Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="preparacao">Em Preparação</option>
                      <option value="transito">Em Trânsito</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Origem</label>
                    <Input
                      placeholder="Miami, FL..."
                      value={filters.origem}
                      onChange={(e) => setFilters({ ...filters, origem: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Destino</label>
                    <Input
                      placeholder="São Paulo, SP..."
                      value={filters.destino}
                      onChange={(e) => setFilters({ ...filters, destino: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      status: 'todos',
                      origem: '',
                      destino: '',
                    })}
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
      {viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredContainers.map((container) => {
              const colors = getStatusColor(container.status);
              const StatusIcon = getStatusIcon(container.status);
              const capacidade = (container.pesoTotal / container.limiteP) * 100;
              
              // Validar datas
              const dataEmbarque = new Date(container.dataEmbarque);
              const previsaoChegada = new Date(container.previsaoChegada);
              const isDataEmbarqueValid = !isNaN(dataEmbarque.getTime());
              const isPrevisaoChegadaValid = !isNaN(previsaoChegada.getTime());

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
                            <CardTitle className="text-lg">{container.numero}</CardTitle>
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
                        <span className="font-medium">{container.origem}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{container.destino}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Embarque</p>
                          <p className="font-semibold">
                            {isDataEmbarqueValid ? format(dataEmbarque, 'dd/MM/yy') : container.dataEmbarque}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Previsão</p>
                          <p className="font-semibold">
                            {isPrevisaoChegadaValid ? format(previsaoChegada, 'dd/MM/yy') : container.previsaoChegada}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Capacidade</span>
                          <span className="font-semibold">
                            {container.pesoTotal} / {container.limiteP} kg
                          </span>
                        </div>
                        <Progress value={capacidade} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {capacidade.toFixed(1)}% utilizado
                        </p>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Box className="w-4 h-4" />
                            Caixas
                          </span>
                          <Badge variant="outline">{container.caixas?.length || 0}</Badge>
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
      {viewMode === 'list' && (
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
                  const capacidade = (container.pesoTotal / container.limiteP) * 100;
                  
                  // Validar datas
                  const dataEmbarque = new Date(container.dataEmbarque);
                  const previsaoChegada = new Date(container.previsaoChegada);
                  const isDataEmbarqueValid = !isNaN(dataEmbarque.getTime());
                  const isPrevisaoChegadaValid = !isNaN(previsaoChegada.getTime());

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
                                <StatusIcon className={`w-6 h-6 ${colors.text}`} />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">{container.numero}</h3>
                                  <Badge className={colors.badge}>
                                    {getStatusLabel(container.status)}
                                  </Badge>
                                  <Badge variant="outline">
                                    {container.caixas?.length || 0} caixas
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground mb-1">Rota</p>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-blue-600" />
                                      <span className="font-medium">{container.origem || 'N/A'}</span>
                                      <ArrowRight className="w-3 h-3" />
                                      <MapPin className="w-3 h-3 text-green-600" />
                                      <span className="font-medium">{container.destino || 'N/A'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">Embarque</p>
                                    <p className="font-semibold">
                                      {isDataEmbarqueValid ? format(dataEmbarque, "dd/MM/yyyy") : container.dataEmbarque}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">Previsão</p>
                                    <p className="font-semibold">
                                      {isPrevisaoChegadaValid ? format(previsaoChegada, "dd/MM/yyyy") : container.previsaoChegada}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground mb-1">Capacidade</p>
                                    <p className="font-semibold">{capacidade.toFixed(0)}%</p>
                                    <Progress value={capacidade} className="h-1 mt-1" />
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
      {viewMode === 'kanban' && (
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
                    <h4 className="font-semibold text-sm">{container.numero}</h4>
                    <div className="text-xs text-muted-foreground">
                      <p>{container.origem || 'N/A'} → {container.destino || 'N/A'}</p>
                      <p className="mt-1">{container.caixas?.length || 0} caixas</p>
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
                    <h4 className="font-semibold text-sm">{container.numero}</h4>
                    <div className="text-xs text-muted-foreground">
                      <p>{container.origem || 'N/A'} → {container.destino || 'N/A'}</p>
                      <p className="mt-1">{container.caixas?.length || 0} caixas</p>
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
                    <h4 className="font-semibold text-sm">{container.numero}</h4>
                    <div className="text-xs text-muted-foreground">
                      <p>{container.origem || 'N/A'} → {container.destino || 'N/A'}</p>
                      <p className="mt-1">{container.caixas?.length || 0} caixas</p>
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
                    <h4 className="font-semibold text-sm">{container.numero}</h4>
                    <div className="text-xs text-muted-foreground">
                      <p>{container.origem} → {container.destino}</p>
                      <p className="mt-1">{container.caixas.length} caixas</p>
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 right-0 w-[700px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-border p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-500 p-4 rounded-full">
                    <ContainerIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedContainer.numero}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedContainer.status).badge}>
                        {getStatusLabel(selectedContainer.status)}
                      </Badge>
                      <Badge variant="outline">
                        {selectedContainer.caixas?.length || 0} caixas
                      </Badge>
                      <Badge variant="outline">
                        {selectedContainer.pesoTotal || 0} kg
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFormData({
                        numero: selectedContainer.numero || '',
                        tipo: selectedContainer.tipo || '20ft',
                        origem: selectedContainer.origem || '',
                        destino: selectedContainer.destino || '',
                        dataEmbarque: selectedContainer.dataEmbarque || '',
                        previsaoChegada: selectedContainer.previsaoChegada || '',
                        status: selectedContainer.status || 'preparacao',
                        volume: selectedContainer.volume?.toString() || '0',
                        limiteP: selectedContainer.limiteP?.toString() || '0',
                        linkRastreamento: selectedContainer.linkRastreamento || '',
                      });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Excluir
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContainer(null)}>
                    <X className="w-5 h-5" />
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
                        <span className="text-sm font-medium text-blue-900">Origem</span>
                      </div>
                      <p className="font-semibold">{selectedContainer.origem}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Destino</span>
                      </div>
                      <p className="font-semibold">{selectedContainer.destino}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data de Embarque</p>
                      <p className="font-semibold">
                        {(() => {
                          const dataEmbarque = new Date(selectedContainer.dataEmbarque);
                          const isValid = !isNaN(dataEmbarque.getTime());
                          return isValid 
                            ? format(dataEmbarque, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : selectedContainer.dataEmbarque;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Previsão de Chegada</p>
                      <p className="font-semibold">
                        {(() => {
                          const previsaoChegada = new Date(selectedContainer.previsaoChegada);
                          const isValid = !isNaN(previsaoChegada.getTime());
                          return isValid 
                            ? format(previsaoChegada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : selectedContainer.previsaoChegada;
                        })()}
                      </p>
                    </div>
                  </div>

                  {selectedContainer.linkRastreamento && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Link de Rastreamento</p>
                      <a 
                        href={selectedContainer.linkRastreamento}
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
                    {getContainerEventos(selectedContainer.id).map((evento, index) => {
                      const Icon = getEventoIcon(evento.tipo);
                      const isLast = index === getContainerEventos(selectedContainer.id).length - 1;

                      return (
                        <div key={evento.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${
                              evento.concluido 
                                ? 'bg-green-100' 
                                : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                evento.concluido 
                                  ? 'text-green-600' 
                                  : 'text-slate-400'
                              }`} />
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 flex-1 min-h-[40px] ${
                                evento.concluido 
                                  ? 'bg-green-200' 
                                  : 'bg-slate-200'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold ${
                                evento.concluido 
                                  ? 'text-foreground' 
                                  : 'text-muted-foreground'
                              }`}>
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
                              {format(evento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
                      <span className="text-sm text-muted-foreground">Peso Utilizado</span>
                      <span className="font-semibold">
                        {selectedContainer.pesoTotal} / {selectedContainer.limiteP} kg
                      </span>
                    </div>
                    <Progress 
                      value={(selectedContainer.pesoTotal / selectedContainer.limiteP) * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      {((selectedContainer.pesoTotal / selectedContainer.limiteP) * 100).toFixed(1)}% da capacidade máxima
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Volume</p>
                      <p className="font-semibold">{selectedContainer.volume} m³</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                      <p className="font-semibold">{selectedContainer.tipo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Caixas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    Caixas no Container ({selectedContainer.caixas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedContainer.caixas.map((caixa: any, index: number) => (
                      <Card key={index} className="bg-slate-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-blue-600" />
                                <h4 className="font-semibold">{caixa.clienteNome}</h4>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>#{caixa.numeroCaixa}</span>
                                <Badge variant="outline" className="text-xs">
                                  {caixa.tamanho}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{caixa.peso} kg</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                <Label htmlFor="numero">Número do Container *</Label>
                <Input
                  id="numero"
                  placeholder="Ex: MSKU1234567"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Container *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20ft">20ft Standard</SelectItem>
                    <SelectItem value="40ft">40ft Standard</SelectItem>
                    <SelectItem value="40ft HC">40ft High Cube</SelectItem>
                    <SelectItem value="45ft HC">45ft High Cube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem">Porto de Origem *</Label>
                <Input
                  id="origem"
                  placeholder="Ex: Miami, FL - USA"
                  value={formData.origem}
                  onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino">Porto de Destino *</Label>
                <Input
                  id="destino"
                  placeholder="Ex: Santos, SP - Brasil"
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmbarque">Data de Embarque *</Label>
                <Input
                  id="dataEmbarque"
                  type="date"
                  value={formData.dataEmbarque}
                  onChange={(e) => setFormData({ ...formData, dataEmbarque: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previsaoChegada">Previsão de Chegada *</Label>
                <Input
                  id="previsaoChegada"
                  type="date"
                  value={formData.previsaoChegada}
                  onChange={(e) => setFormData({ ...formData, previsaoChegada: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume (m³) *</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 67.5"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limiteP">Limite de Peso (kg) *</Label>
                <Input
                  id="limiteP"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 28000"
                  value={formData.limiteP}
                  onChange={(e) => setFormData({ ...formData, limiteP: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="linkRastreamentoEdit">Link de Rastreamento</Label>
                <Input
                  id="linkRastreamentoEdit"
                  type="url"
                  placeholder="Ex: https://tracking.example.com/CNT123456"
                  value={formData.linkRastreamento}
                  onChange={(e) => setFormData({ ...formData, linkRastreamento: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  URL completa do sistema de rastreamento do container
                </p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="status">Status Inicial *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparacao">Em Preparação</SelectItem>
                    <SelectItem value="transito">Em Trânsito</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
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
              <Button type="submit">
                Atualizar Container
              </Button>
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
              Tem certeza que deseja excluir este container? Esta ação não pode ser desfeita.
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
                      <h3 className="font-semibold text-red-900">{selectedContainer.numero}</h3>
                      <p className="text-sm text-red-700">{selectedContainer.origem} → {selectedContainer.destino}</p>
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
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Container
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}