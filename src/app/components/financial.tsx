import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useData } from '../context/DataContext';
import { Transacao } from '../api';
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
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

type ViewMode = 'todas' | 'receitas' | 'despesas';
type PeriodFilter = 'todos' | 'mes' | 'trimestre' | 'ano';

const CATEGORIAS_RECEITA = [
  'Serviço de Mudança',
  'Container Compartilhado',
  'Container Exclusivo',
  'Embalagem',
  'Seguro',
  'Outros',
];

const CATEGORIAS_DESPESA = [
  'Transporte',
  'Combustível',
  'Manutenção',
  'Salários',
  'Aluguel',
  'Material de Embalagem',
  'Marketing',
  'Outros',
];

const METODOS_PAGAMENTO = [
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência Bancária',
  'PIX',
  'Dinheiro',
  'Cheque',
];

export default function FinanceiroView() {
  const { transacoes, addTransacao, deleteTransacao, clientes } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('todas');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('mes');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transacao | null>(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    tipo: 'receita' as 'receita' | 'despesa',
    categoria: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    metodoPagamento: '',
  });

  const resetForm = () => {
    setFormData({
      clienteId: '',
      tipo: 'receita',
      categoria: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      metodoPagamento: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cliente = clientes.find(c => c.id === formData.clienteId);
    
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      clienteId: formData.clienteId,
      clienteNome: cliente?.usaNome || 'N/A',
      tipo: formData.tipo,
      categoria: formData.categoria,
      valor: parseFloat(formData.valor),
      data: formData.data,
      descricao: formData.descricao,
      metodoPagamento: formData.metodoPagamento,
    };

    addTransacao(novaTransacao);
    toast.success('Transação registrada com sucesso!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransacao(id);
      toast.success('Transação excluída!');
      if (selectedTransaction?.id === id) {
        setSelectedTransaction(null);
      }
    }
  };

  // Filtrar transações
  const filteredTransacoes = useMemo(() => {
    let filtered = transacoes;

    // Filtro por tipo
    if (viewMode === 'receitas') {
      filtered = filtered.filter(t => t.tipo === 'receita');
    } else if (viewMode === 'despesas') {
      filtered = filtered.filter(t => t.tipo === 'despesa');
    }

    // Filtro por período
    if (periodFilter !== 'todos') {
      const now = new Date();
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.data);
        const diffTime = now.getTime() - transactionDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (periodFilter === 'mes') return diffDays <= 30;
        if (periodFilter === 'trimestre') return diffDays <= 90;
        if (periodFilter === 'ano') return diffDays <= 365;
        return true;
      });
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [transacoes, viewMode, periodFilter, searchTerm]);

  // Cálculos
  const receitas = filteredTransacoes.filter(t => t.tipo === 'receita');
  const despesas = filteredTransacoes.filter(t => t.tipo === 'despesa');
  const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
  const lucro = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? ((lucro / totalReceitas) * 100).toFixed(1) : 0;

  // Ticket médio
  const ticketMedio = receitas.length > 0 ? totalReceitas / receitas.length : 0;

  // Transação por categoria
  const receitasPorCategoria = useMemo(() => {
    const categorias: Record<string, number> = {};
    receitas.forEach(t => {
      categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
    });
    return Object.entries(categorias).map(([name, value]) => ({
      name,
      value,
      color: '#10B981'
    }));
  }, [receitas]);

  const despesasPorCategoria = useMemo(() => {
    const categorias: Record<string, number> = {};
    despesas.forEach(t => {
      categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
    });
    return Object.entries(categorias).map(([name, value]) => ({
      name,
      value,
      color: '#EF4444'
    }));
  }, [despesas]);

  // Dados para gráfico de linha temporal
  const fluxoCaixaMensal = useMemo(() => {
    const meses: Record<string, { receitas: number; despesas: number; lucro: number }> = {};
    
    filteredTransacoes.forEach(t => {
      const data = new Date(t.data);
      const mesAno = format(data, 'MMM/yy', { locale: ptBR });
      
      if (!meses[mesAno]) {
        meses[mesAno] = { receitas: 0, despesas: 0, lucro: 0 };
      }
      
      if (t.tipo === 'receita') {
        meses[mesAno].receitas += t.valor;
      } else {
        meses[mesAno].despesas += t.valor;
      }
      meses[mesAno].lucro = meses[mesAno].receitas - meses[mesAno].despesas;
    });

    return Object.entries(meses)
      .map(([mes, valores]) => ({ mes, ...valores }))
      .slice(-6); // Últimos 6 meses
  }, [filteredTransacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD'
    }).format(value);
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, any> = {
      'Serviço de Mudança': Banknote,
      'Container': CircleDollarSign,
      'Embalagem': Receipt,
      'Transporte': Activity,
      'Combustível': Activity,
      'Salários': Wallet,
    };
    return icons[categoria] || DollarSign;
  };

  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestão Financeira</h2>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Fluxo de caixa, receitas e despesas
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
            <Button
              variant={showFilters ? 'default' : 'outline'}
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
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="col-span-2 w-full sm:w-auto sm:col-span-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
                <DialogHeader>
                  <DialogTitle>Nova Transação</DialogTitle>
                  <DialogDescription>
                    Registre uma receita ou despesa
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo === 'receita' && (
                    <div className="space-y-2">
                      <Label htmlFor="clienteId">Cliente</Label>
                      <Select
                        value={formData.clienteId}
                        onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map(cliente => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.usaNome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(formData.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (USD) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data">Data *</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metodoPagamento">Método de Pagamento *</Label>
                      <Select
                        value={formData.metodoPagamento}
                        onValueChange={(value) => setFormData({ ...formData, metodoPagamento: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {METODOS_PAGAMENTO.map(metodo => (
                            <SelectItem key={metodo} value={metodo}>
                              {metodo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }} className="w-full sm:w-auto">
                      Cancelar
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                      Registrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-green-900">Receitas</span>
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-green-900">{formatCurrency(totalReceitas)}</p>
            <p className="text-xs text-green-700 mt-1">{receitas.length} transação(ões)</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-red-900">Despesas</span>
              <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-red-900">{formatCurrency(totalDespesas)}</p>
            <p className="text-xs text-red-700 mt-1">{despesas.length} transação(ões)</p>
          </Card>

          <Card className={`p-4 lg:p-5 bg-gradient-to-br border-2 ${
            lucro >= 0 
              ? 'from-blue-50 to-blue-100 border-blue-200' 
              : 'from-orange-50 to-orange-100 border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs lg:text-sm font-medium ${lucro >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                Lucro Líquido
              </span>
              <DollarSign className={`w-4 h-4 lg:w-5 lg:h-5 ${lucro >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <p className={`text-2xl lg:text-3xl font-bold ${lucro >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {formatCurrency(lucro)}
            </p>
            <p className={`text-xs mt-1 ${lucro >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Margem: {margemLucro}%
            </p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-purple-900">Ticket Médio</span>
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-purple-900">{formatCurrency(ticketMedio)}</p>
            <p className="text-xs text-purple-700 mt-1">Por transação</p>
          </Card>

          <Card className="p-4 lg:p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-cyan-900">Total</span>
              <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-cyan-900">{filteredTransacoes.length}</p>
            <p className="text-xs text-cyan-700 mt-1">Transações</p>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, categoria ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30 w-full sm:w-auto">
            <Button
              variant={viewMode === 'todas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('todas')}
              className="flex-1 sm:flex-none"
            >
              Todas
            </Button>
            <Button
              variant={viewMode === 'receitas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('receitas')}
              className="flex-1 sm:flex-none"
            >
              Receitas
            </Button>
            <Button
              variant={viewMode === 'despesas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('despesas')}
              className="flex-1 sm:flex-none"
            >
              Despesas
            </Button>
          </div>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-white w-full sm:w-auto"
          >
            <option value="todos">Todos os períodos</option>
            <option value="mes">Último mês</option>
            <option value="trimestre">Último trimestre</option>
            <option value="ano">Último ano</option>
          </select>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Fluxo de Caixa */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>
              Receitas vs Despesas - Últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fluxoCaixaMensal}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fill="url(#colorReceitas)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  fill="url(#colorDespesas)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Receitas por Categoria */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
            <CardDescription>
              Distribuição de {receitas.length} receita(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={receitasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${String(name).slice(0, 10)}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {receitasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${142 + index * 30}, 70%, ${50 + index * 5}%)`} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Despesas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>
            Distribuição de {despesas.length} despesa(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={despesasPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar 
                dataKey="value" 
                fill="#EF4444"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Histórico de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            {filteredTransacoes.length} transação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTransacoes.slice().reverse().map(transacao => {
                const data = new Date(transacao.data);
                const isDataValid = !isNaN(data.getTime());

                return (
                  <motion.div
                    key={transacao.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
                        transacao.tipo === 'receita' 
                          ? 'border-green-500 bg-green-50/50' 
                          : 'border-red-500 bg-red-50/50'
                      }`}
                      onClick={() => setSelectedTransaction(transacao)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={
                                transacao.tipo === 'receita' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }>
                                {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                              </Badge>
                              <span className="font-semibold break-words">{transacao.categoria}</span>
                              <Badge variant="outline" className="text-xs">
                                {transacao.metodoPagamento}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1 break-words">
                              {transacao.descricao}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {isDataValid ? format(data, "dd/MM/yyyy", { locale: ptBR }) : transacao.data}
                              </span>
                              {transacao.clienteNome !== 'N/A' && (
                                <span className="flex items-center gap-1 break-words">
                                  <CreditCard className="w-3 h-3" />
                                  {transacao.clienteNome}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className={`text-base sm:text-xl font-bold ${
                              transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(transacao.id);
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
                );
              })}
            </AnimatePresence>

            {filteredTransacoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
