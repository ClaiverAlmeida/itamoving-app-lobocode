import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Container, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  Clock,
  Truck,
  MapPin,
  Activity,
  Bell,
  CheckCircle2,
  XCircle,
  Boxes,
  Sparkles,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  ShoppingCart,
  Navigation,
  Star,
  Zap,
  Target,
  MessageSquare
} from 'lucide-react';
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
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface Alerta {
  id: string;
  tipo: 'critico' | 'atencao' | 'info';
  titulo: string;
  descricao: string;
  icone: any;
  link?: string;
  navigateTo?: View; // ← Adicionar view para navegação
}

interface AtividadeRecente {
  id: string;
  tipo: 'cliente' | 'agendamento' | 'container' | 'estoque';
  descricao: string;
  data: Date;
  icone: any;
  color: string;
}

type View = 'dashboard' | 'clientes' | 'estoque' | 'agendamentos' | 'containers' | 'financeiro' | 'relatorios' | 'atendimentos';

interface DashboardViewProps {
  onNavigate?: (view: View) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps = {}) {
  const { clientes, estoque, agendamentos, containers, transacoes } = useData();
  const { user, hasPermission } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'dia' | 'semana' | 'mes'>('semana');

  // Cálculos
  const agendamentosHoje = agendamentos.filter(a => {
    const hoje = new Date().toISOString().split('T')[0];
    return a.dataColeta === hoje;
  }).length;

  const agendamentosAmanha = agendamentos.filter(a => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return a.dataColeta === amanha;
  }).length;

  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;

  const receitaTotal = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const despesaTotal = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  const lucro = receitaTotal - despesaTotal;
  const margemLucro = receitaTotal > 0 ? ((lucro / receitaTotal) * 100).toFixed(1) : 0;

  const estoqueTotal = estoque.smallBoxes + estoque.mediumBoxes + estoque.largeBoxes + estoque.adhesiveTape + estoque.personalizedItems;
  const estoqueBaixo = [
    { tipo: 'Caixas Pequenas', qtd: estoque.smallBoxes, minimo: 50 },
    { tipo: 'Caixas Médias', qtd: estoque.mediumBoxes, minimo: 30 },
    { tipo: 'Caixas Grandes', qtd: estoque.largeBoxes, minimo: 20 },
    { tipo: 'Itens Personalizados', qtd: estoque.personalizedItems, minimo: 10 },
    { tipo: 'Fitas', qtd: estoque.adhesiveTape, minimo: 40 },
  ].filter(item => item.qtd < item.minimo);

  const containersAtivos = containers.filter(c => 
    c.status === 'preparacao' || c.status === 'transito'
  ).length;

  const containersEmTransito = containers.filter(c => c.status === 'transito').length;

  const clientesNovosUltimaSemana = clientes.filter(c => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(c.dataCadastro) >= weekAgo;
  }).length;

  // Alertas
  const alertas = useMemo<Alerta[]>(() => {
    const alerts: Alerta[] = [];

    // Agendamentos atrasados
    const atrasados = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.dataColeta + 'T00:00:00');
      return isPast(dataAgendamento) && a.status === 'pendente' && !isToday(dataAgendamento);
    });
    
    if (atrasados.length > 0) {
      alerts.push({
        id: 'agendamentos-atrasados',
        tipo: 'critico',
        titulo: 'Agendamentos Atrasados',
        descricao: `${atrasados.length} agendamento(s) pendente(s) com data vencida`,
        icone: AlertTriangle,
        navigateTo: 'agendamentos', // ← Navegação
      });
    }

    // Estoque baixo
    if (estoqueBaixo.length > 0) {
      alerts.push({
        id: 'estoque-baixo',
        tipo: 'atencao',
        titulo: 'Estoque Baixo',
        descricao: `${estoqueBaixo.length} item(ns) abaixo do mínimo recomendado`,
        icone: Package,
        navigateTo: 'estoque', // ← Navegação
      });
    }

    // Agendamentos hoje
    if (agendamentosHoje > 0) {
      alerts.push({
        id: 'agendamentos-hoje',
        tipo: 'info',
        titulo: 'Agendamentos Hoje',
        descricao: `${agendamentosHoje} coleta(s) programada(s) para hoje`,
        icone: Calendar,
        navigateTo: 'agendamentos', // ← Navegação
      });
    }

    // Containers em trânsito
    if (containersEmTransito > 0) {
      alerts.push({
        id: 'containers-transito',
        tipo: 'info',
        titulo: 'Containers em Trânsito',
        descricao: `${containersEmTransito} container(s) em transporte marítimo`,
        icone: Truck,
        navigateTo: 'containers', // ← Navegação
      });
    }

    return alerts;
  }, [agendamentos, estoqueBaixo, agendamentosHoje, containersEmTransito]);

  // Atividades Recentes
  const atividadesRecentes = useMemo<AtividadeRecente[]>(() => {
    const atividades: AtividadeRecente[] = [];

    // Últimos clientes
    clientes
      .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime())
      .slice(0, 2)
      .forEach(c => {
        const dataCadastro = new Date(c.dataCadastro);
        // Só adiciona se a data for válida
        if (!isNaN(dataCadastro.getTime())) {
          atividades.push({
            id: `cliente-${c.id}`,
            tipo: 'cliente',
            descricao: `Novo cliente cadastrado: ${c.nome}`,
            data: dataCadastro,
            icone: Users,
            color: 'blue',
          });
        }
      });

    // Últimos agendamentos
    agendamentos
      .slice(0, 2)
      .forEach(a => {
        atividades.push({
          id: `agendamento-${a.id}`,
          tipo: 'agendamento',
          descricao: `Agendamento criado para ${a.clienteNome}`,
          data: new Date(),
          icone: Calendar,
          color: 'green',
        });
      });

    // Containers recentes
    containers
      .slice(0, 2)
      .forEach(c => {
        const dataEmbarque = new Date(c.dataEmbarque);
        // Só adiciona se a data for válida
        if (!isNaN(dataEmbarque.getTime())) {
          atividades.push({
            id: `container-${c.id}`,
            tipo: 'container',
            descricao: `Container ${c.numero} - ${c.status}`,
            data: dataEmbarque,
            icone: Container,
            color: 'purple',
          });
        }
      });

    return atividades.sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, 5);
  }, [clientes, agendamentos, containers]);

  // Dados para gráfico de receitas vs despesas
  const financeiroData = [
    { mes: 'Jul', receitas: 45000, despesas: 28000, lucro: 17000 },
    { mes: 'Ago', receitas: 52000, despesas: 31000, lucro: 21000 },
    { mes: 'Set', receitas: 48000, despesas: 29000, lucro: 19000 },
    { mes: 'Out', receitas: 61000, despesas: 35000, lucro: 26000 },
    { mes: 'Nov', receitas: 58000, despesas: 33000, lucro: 25000 },
    { mes: 'Dez', receitas: receitaTotal, despesas: despesaTotal, lucro: lucro },
  ];

  // Dados para gráfico de status de containers
  const containersStatusData = [
    { name: 'Em Preparação', value: containers.filter(c => c.status === 'preparacao').length, color: '#F5A623' },
    { name: 'Em Trânsito', value: containers.filter(c => c.status === 'transito').length, color: '#5DADE2' },
    { name: 'Entregue', value: containers.filter(c => c.status === 'entregue').length, color: '#10B981' },
    { name: 'Cancelado', value: containers.filter(c => c.status === 'cancelado').length, color: '#EF4444' },
  ];

  // Dados para gráfico de estoque
  const estoqueData = [
    { tipo: 'Pequenas', quantidade: estoque.smallBoxes, fill: '#5DADE2' },
    { tipo: 'Médias', quantidade: estoque.mediumBoxes, fill: '#F5A623' },
    { tipo: 'Grandes', quantidade: estoque.largeBoxes, fill: '#1E3A5F' },
    { tipo: 'Itens Personalizados', quantidade: estoque.personalizedItems, fill: '#94A3B8' }, 
    { tipo: 'Fitas', quantidade: estoque.adhesiveTape, fill: '#94A3B8' },
  ];

  // Dados de performance semanal
  const performanceData = [
    { dia: 'Seg', clientes: 5, agendamentos: 8, containers: 2 },
    { dia: 'Ter', clientes: 7, agendamentos: 6, containers: 3 },
    { dia: 'Qua', clientes: 4, agendamentos: 10, containers: 1 },
    { dia: 'Qui', clientes: 6, agendamentos: 7, containers: 2 },
    { dia: 'Sex', clientes: 8, agendamentos: 9, containers: 4 },
    { dia: 'Sáb', clientes: 3, agendamentos: 4, containers: 1 },
    { dia: 'Dom', clientes: 2, agendamentos: 2, containers: 0 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const getAlertaColor = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'critico': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' };
      case 'atencao': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-600' };
      case 'info': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' };
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header com saudação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Bem-vindo ao ITAMOVING! 👋
          </h2>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {hasPermission('relatorios', 'read') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate?.('relatorios')}
              className="flex-1 sm:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
          )}
          <Button size="sm" className="flex-1 sm:flex-none">
            <Sparkles className="w-4 h-4 mr-2" />
            Insights IA
          </Button>
        </div>
      </div>

      {/* Alertas Importantes */}
      {alertas.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {alertas.map((alerta) => {
              const Icon = alerta.icone;
              const colors = getAlertaColor(alerta.tipo);
              
              return (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className={`${colors.bg} ${colors.border} border-l-4`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${colors.bg}`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${colors.text}`}>{alerta.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => onNavigate?.(alerta.navigateTo!)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* KPI Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Total de Clientes
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{clientes.length}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-200 text-blue-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{clientesNovosUltimaSemana} esta semana
                </Badge>
              </div>
              <p className="text-xs text-blue-700 mt-1">Cadastros ativos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Agendamentos
              </CardTitle>
              <Calendar className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{agendamentosHoje}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-200 text-green-800">
                  Hoje
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {agendamentosAmanha} amanhã
                </Badge>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {agendamentosPendentes} pendentes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Mostrar Taxa de Conversão para Comercial, Receita para Admin */}
          {!hasPermission('financeiro', 'read') ? (
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-900">
                  Taxa de Conversão
                </CardTitle>
                <Target className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-900">
                  87.5%
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-indigo-200 text-indigo-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% este mês
                  </Badge>
                </div>
                <p className="text-xs text-indigo-700 mt-1">
                  35 de 40 leads convertidos
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">
                  Receita Total
                </CardTitle>
                <DollarSign className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">
                  {formatCurrency(receitaTotal)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-purple-200 text-purple-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Margem {margemLucro}%
                  </Badge>
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  Lucro: {formatCurrency(lucro)}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`bg-gradient-to-br border-2 hover:shadow-xl transition-all cursor-pointer group ${
            estoqueBaixo.length > 0 
              ? 'from-orange-50 to-orange-100 border-orange-300' 
              : 'from-slate-50 to-slate-100 border-slate-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${
                estoqueBaixo.length > 0 ? 'text-orange-900' : 'text-slate-900'
              }`}>
                Estoque Total
              </CardTitle>
              <Package className={`h-5 w-5 group-hover:scale-110 transition-transform ${
                estoqueBaixo.length > 0 ? 'text-orange-600' : 'text-slate-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                estoqueBaixo.length > 0 ? 'text-orange-900' : 'text-slate-900'
              }`}>
                {estoqueTotal}
              </div>
              {estoqueBaixo.length > 0 ? (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-orange-200 text-orange-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {estoqueBaixo.length} item(ns) baixo(s)
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-200 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Níveis normais
                  </Badge>
                </div>
              )}
              <p className={`text-xs mt-1 ${
                estoqueBaixo.length > 0 ? 'text-orange-700' : 'text-slate-700'
              }`}>
                P: {estoque.smallBoxes} | M: {estoque.mediumBoxes} | G: {estoque.largeBoxes} | Itens Personalizados: {estoque.personalizedItems} | Fitas: {estoque.adhesiveTape}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* KPI Cards Secundários */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-900">Containers Ativos</p>
                <p className="text-2xl font-bold text-cyan-900 mt-1">{containersAtivos}</p>
                <p className="text-xs text-cyan-700 mt-1">{containersEmTransito} em trânsito</p>
              </div>
              <Truck className="w-10 h-10 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">87.5%</p>
                <p className="text-xs text-indigo-700 mt-1">Leads para clientes</p>
              </div>
              <TrendingUp className="w-10 h-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-900">Tempo Médio</p>
                <p className="text-2xl font-bold text-pink-900 mt-1">4-6 sem</p>
                <p className="text-xs text-pink-700 mt-1">Entrega porta a porta</p>
              </div>
              <Clock className="w-10 h-10 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className={`grid gap-6 ${hasPermission('financeiro', 'read') ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        {/* Gráfico de Performance Financeira - Apenas para Admin */}
        {hasPermission('financeiro', 'read') && (
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Financeira</CardTitle>
                  <CardDescription>
                    Receitas, despesas e lucro dos últimos 6 meses
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15.3%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={financeiroData}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
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
                  <Line 
                    type="monotone" 
                    dataKey="lucro" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    fill="url(#colorLucro)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Status de Containers */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status dos Containers</CardTitle>
                <CardDescription>
                  Distribuição atual dos {containers.length} containers
                </CardDescription>
              </div>
              <Badge variant="outline">{containersAtivos} ativos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={containersStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                >
                  {containersStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda Linha de Gráficos */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Gráfico de Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Inventário de Estoque</CardTitle>
            <CardDescription>
              Quantidade disponível por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={estoqueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="tipo" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="quantidade" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                >
                  {estoqueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Semanal</CardTitle>
            <CardDescription>
              Atividades dos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="dia" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="clientes" fill="#5DADE2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="agendamentos" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="containers" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas atualizações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[250px] overflow-y-auto">
              {atividadesRecentes.map((atividade) => {
                const Icon = atividade.icone;
                
                return (
                  <motion.div
                    key={atividade.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`p-2 rounded-full ${
                      atividade.color === 'blue' ? 'bg-blue-100' :
                      atividade.color === 'green' ? 'bg-green-100' :
                      atividade.color === 'purple' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        atividade.color === 'blue' ? 'text-blue-600' :
                        atividade.color === 'green' ? 'text-green-600' :
                        atividade.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{atividade.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(atividade.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próximos Agendamentos
              </CardTitle>
              <CardDescription>
                Coletas programadas para os próximos dias
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate?.('agendamentos')}>
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agendamentos.slice(0, 6).map((agendamento) => {
              const dataAgendamento = new Date(agendamento.dataColeta + 'T00:00:00');
              const ehHoje = isToday(dataAgendamento);
              const ehAmanha = isTomorrow(dataAgendamento);
              
              return (
                <motion.div
                  key={agendamento.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`hover:shadow-lg transition-all border-l-4 ${
                    ehHoje ? 'border-green-500 bg-green-50' :
                    ehAmanha ? 'border-blue-500 bg-blue-50' :
                    'border-slate-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm">{agendamento.clienteNome}</h4>
                          <Badge className={
                            agendamento.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                            agendamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {agendamento.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(dataAgendamento, "dd/MM/yyyy")}</span>
                          {ehHoje && <Badge className="bg-green-500 text-white text-xs">Hoje</Badge>}
                          {ehAmanha && <Badge className="bg-blue-500 text-white text-xs">Amanhã</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{agendamento.horaColeta}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{agendamento.endereco}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {agendamentos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}