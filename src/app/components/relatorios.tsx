import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useData } from '../context/DataContext';
import { 
  Search, 
  Download, 
  FileText, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Ship,
  MapPin,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Award,
  Briefcase,
  Filter,
  ChevronRight,
  FileSpreadsheet,
  FileBarChart,
  FilePieChart,
  UserCheck,
  Boxes,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUpIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

type ReportType = 'visao-geral' | 'clientes' | 'financeiro' | 'operacional' | 'atendimento';

export default function RelatoriosView() {
  const { clientes, transacoes, agendamentos, containers, estoque } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportType>('visao-geral');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    inicio: '',
    fim: ''
  });

  // Garantir que estoque seja sempre um array
  const estoqueArray = Array.isArray(estoque) ? estoque : [];

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf.includes(searchTerm) ||
    cliente.telefoneUSA.includes(searchTerm)
  );

  const gerarRelatorioPDF = (tipo: string) => {
    alert(`Gerando relatório de ${tipo}... (funcionalidade demonstrativa)`);
  };

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalClientes = clientes.length;
    const totalAgendamentos = agendamentos.length;
    const totalContainers = containers.length;
    const totalTransacoes = transacoes.length;
    const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
    const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);
    const lucro = receitas - despesas;
    const margemLucro = receitas > 0 ? ((lucro / receitas) * 100).toFixed(1) : 0;
    
    // Containers por status
    const containersPreparacao = containers.filter(c => c.status === 'preparacao').length;
    const containersTransito = containers.filter(c => c.status === 'transito').length;
    const containersEntregue = containers.filter(c => c.status === 'entregue').length;
    
    // Agendamentos por status
    const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
    const agendamentosConcluidos = agendamentos.filter(a => a.status === 'concluido').length;
    
    // Ticket médio
    const ticketMedio = totalClientes > 0 ? receitas / totalClientes : 0;
    
    // Crescimento mensal (simulado)
    const crescimentoMensal = 12.5;
    
    return {
      totalClientes,
      totalAgendamentos,
      totalContainers,
      totalTransacoes,
      receitas,
      despesas,
      lucro,
      margemLucro,
      containersPreparacao,
      containersTransito,
      containersEntregue,
      agendamentosConfirmados,
      agendamentosPendentes,
      agendamentosConcluidos,
      ticketMedio,
      crescimentoMensal
    };
  }, [clientes, transacoes, agendamentos, containers]);

  // Clientes por origem (USA)
  const clientesPorEstado = useMemo(() => {
    const estados: Record<string, number> = {};
    clientes.forEach(c => {
      const estado = c.enderecoUSA.estado;
      estados[estado] = (estados[estado] || 0) + 1;
    });
    return Object.entries(estados)
      .map(([estado, quantidade]) => ({ estado, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [clientes]);

  // Receitas mensais
  const receitasMensais = useMemo(() => {
    const meses: Record<string, number> = {};
    transacoes
      .filter(t => t.tipo === 'receita')
      .forEach(t => {
        const data = new Date(t.data);
        const mesAno = format(data, 'MMM/yy', { locale: ptBR });
        meses[mesAno] = (meses[mesAno] || 0) + t.valor;
      });
    return Object.entries(meses)
      .map(([mes, valor]) => ({ mes, valor }))
      .slice(-6);
  }, [transacoes]);

  // Performance de atendentes
  const performanceAtendentes = useMemo(() => {
    const atendentes: Record<string, { clientes: number; receitas: number }> = {};
    
    clientes.forEach(c => {
      if (!atendentes[c.atendente]) {
        atendentes[c.atendente] = { clientes: 0, receitas: 0 };
      }
      atendentes[c.atendente].clientes += 1;
      
      // Somar receitas do cliente
      const receitasCliente = transacoes
        .filter(t => t.clienteId === c.id && t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      atendentes[c.atendente].receitas += receitasCliente;
    });
    
    return Object.entries(atendentes).map(([nome, dados]) => ({
      nome,
      clientes: dados.clientes,
      receitas: dados.receitas,
      ticketMedio: dados.clientes > 0 ? dados.receitas / dados.clientes : 0
    })).sort((a, b) => b.receitas - a.receitas);
  }, [clientes, transacoes]);

  // Categorias de despesas
  const categoriasDespesas = useMemo(() => {
    const categorias: Record<string, number> = {};
    transacoes
      .filter(t => t.tipo === 'despesa')
      .forEach(t => {
        categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
      });
    return Object.entries(categorias)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [transacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD'
    }).format(value);
  };

  const reportTypes = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'operacional', label: 'Operacional', icon: Boxes },
    { id: 'atendimento', label: 'Atendimento', icon: UserCheck },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Relatórios e Análises</h2>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Dashboards executivos e insights de negócio
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={() => gerarRelatorioPDF('completo')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Tudo
            </Button>
          </div>
        </div>

        {/* Navegação de Relatórios */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {reportTypes.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                variant={selectedReport === type.id ? 'default' : 'outline'}
                onClick={() => setSelectedReport(type.id as ReportType)}
                className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                size="sm"
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Visão Geral */}
      {selectedReport === 'visao-geral' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* KPIs Principais */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Receitas</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(estatisticas.receitas)}</p>
              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +{estatisticas.crescimentoMensal}% este mês
              </p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-900">Despesas</span>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-900">{formatCurrency(estatisticas.despesas)}</p>
              <p className="text-xs text-red-700 mt-1">{estatisticas.totalTransacoes} transações</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Lucro</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(estatisticas.lucro)}</p>
              <p className="text-xs text-green-700 mt-1">Margem: {estatisticas.margemLucro}%</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Clientes</span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">{estatisticas.totalClientes}</p>
              <p className="text-xs text-purple-700 mt-1">Total cadastrados</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">Containers</span>
                <Ship className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">{estatisticas.totalContainers}</p>
              <p className="text-xs text-orange-700 mt-1">{estatisticas.containersTransito} em trânsito</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-cyan-900">Ticket Médio</span>
                <Target className="w-5 h-5 text-cyan-600" />
              </div>
              <p className="text-3xl font-bold text-cyan-900">{formatCurrency(estatisticas.ticketMedio)}</p>
              <p className="text-xs text-cyan-700 mt-1">Por cliente</p>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Receitas Mensais */}
            <Card>
              <CardHeader>
                <CardTitle>Receitas Mensais</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={receitasMensais}>
                    <defs>
                      <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="mes" stroke="#64748B" />
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
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#colorReceitas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status dos Containers */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Containers</CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Em Preparação', value: estatisticas.containersPreparacao },
                        { name: 'Em Trânsito', value: estatisticas.containersTransito },
                        { name: 'Entregue', value: estatisticas.containersEntregue },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#F59E0B" />
                      <Cell fill="#3B82F6" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cards Informativos */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Confirmados</span>
                  <Badge className="bg-green-100 text-green-800">{estatisticas.agendamentosConfirmados}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pendentes</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{estatisticas.agendamentosPendentes}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Concluídos</span>
                  <Badge className="bg-blue-100 text-blue-800">{estatisticas.agendamentosConcluidos}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total de Itens</span>
                  <Badge className="bg-green-100 text-green-800">{estoqueArray.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Em Estoque</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {estoqueArray.filter(i => i.quantidade > 0).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Baixo Estoque</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {estoqueArray.filter(i => i.quantidade < i.minimo).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-purple-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Crescimento</span>
                  <Badge className="bg-green-100 text-green-800">+{estatisticas.crescimentoMensal}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Margem de Lucro</span>
                  <Badge className="bg-blue-100 text-blue-800">{estatisticas.margemLucro}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Conversão</span>
                  <Badge className="bg-purple-100 text-purple-800">87%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Relatório de Clientes */}
      {selectedReport === 'clientes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Clientes por Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Clientes por Estado (USA)</CardTitle>
                <CardDescription>Top 10 estados de origem</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={clientesPorEstado} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#64748B" />
                    <YAxis dataKey="estado" type="category" stroke="#64748B" width={50} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="quantidade" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Busca de Clientes */}
            <Card>
              <CardHeader>
                <CardTitle>Busca de Clientes</CardTitle>
                <CardDescription>Busque por nome, CPF ou telefone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {filteredClientes.map(cliente => (
                    <Card key={cliente.id} className="bg-slate-50">
                      <CardContent className="p-3">
                        <h3 className="font-semibold mb-2">{cliente.nome}</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p>CPF: {cliente.cpf}</p>
                            <p>Tel: {cliente.telefoneUSA}</p>
                          </div>
                          <div>
                            <p>{cliente.enderecoUSA.cidade}, {cliente.enderecoUSA.estado}</p>
                            <p>→ {cliente.destinoBrasil.cidade}, {cliente.destinoBrasil.estado}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredClientes.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </div>
                  )}

                  {!searchTerm && (
                    <div className="text-center py-8 text-muted-foreground">
                      Digite algo para buscar
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Relatório Financeiro */}
      {selectedReport === 'financeiro' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(estatisticas.receitas)}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  {transacoes.filter(t => t.tipo === 'receita').length} transação(ões)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => gerarRelatorioPDF('receitas')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-900">
                  {formatCurrency(estatisticas.despesas)}
                </p>
                <p className="text-sm text-red-700 mt-2">
                  {transacoes.filter(t => t.tipo === 'despesa').length} transação(ões)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => gerarRelatorioPDF('despesas')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 border-2">
              <CardHeader>
                <CardTitle className="text-lg">Lucro Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-900">
                  {formatCurrency(estatisticas.lucro)}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Margem de {estatisticas.margemLucro}%
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => gerarRelatorioPDF('lucro')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Despesas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Distribuição dos gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoriasDespesas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="categoria" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" fill="#EF4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Relatório Operacional */}
      {selectedReport === 'operacional' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Total Containers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-900">{estatisticas.totalContainers}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => gerarRelatorioPDF('containers')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg">Em Preparação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-yellow-900">{estatisticas.containersPreparacao}</p>
                <p className="text-sm text-yellow-700 mt-2">Sendo carregados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Em Trânsito</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-900">{estatisticas.containersTransito}</p>
                <p className="text-sm text-purple-700 mt-2">No oceano</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">Entregues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-900">{estatisticas.containersEntregue}</p>
                <p className="text-sm text-green-700 mt-2">Completos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-lg">Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-cyan-900">{estatisticas.totalAgendamentos}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => gerarRelatorioPDF('agendamentos')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">Itens de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-orange-900">{estoqueArray.length}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => gerarRelatorioPDF('estoque')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardHeader>
                <CardTitle className="text-lg">Baixo Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-pink-900">
                  {estoqueArray.filter(i => i.quantidade < i.minimo).length}
                </p>
                <p className="text-sm text-pink-700 mt-2">Necessitam reposição</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Relatório de Atendimento */}
      {selectedReport === 'atendimento' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance por Atendente</CardTitle>
              <CardDescription>Ranking de atendentes por receitas geradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceAtendentes.map((atendente, index) => (
                  <Card key={atendente.nome} className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{atendente.nome}</h3>
                            <div className="flex gap-4 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {atendente.clientes} clientes
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Ticket: {formatCurrency(atendente.ticketMedio)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(atendente.receitas)}
                          </p>
                          <p className="text-xs text-muted-foreground">Total em receitas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}