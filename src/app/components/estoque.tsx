import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useData } from '../context/DataContext';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Archive,
  ShoppingCart,
  BarChart3,
  Download,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  item: string;
  quantidade: number;
  data: Date;
  responsavel: string;
  observacao?: string;
}

const ESTOQUE_MINIMO = {
  caixasPequenas: 50,
  caixasMedias: 30,
  caixasGrandes: 20,
  fitas: 40,
};

const ESTOQUE_IDEAL = {
  caixasPequenas: 200,
  caixasMedias: 150,
  caixasGrandes: 100,
  fitas: 150,
};

export default function EstoqueView() {
  const { estoque, updateEstoque } = useData();
  const [quantidades, setQuantidades] = useState({
    caixasPequenas: 0,
    caixasMedias: 0,
    caixasGrandes: 0,
    fitas: 0,
  });

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([
    { 
      id: '1', 
      tipo: 'entrada', 
      item: 'Caixas Pequenas', 
      quantidade: 100, 
      data: new Date('2024-12-20T10:30:00'), 
      responsavel: 'João Silva',
      observacao: 'Compra mensal'
    },
    { 
      id: '2', 
      tipo: 'saida', 
      item: 'Caixas Médias', 
      quantidade: 25, 
      data: new Date('2024-12-21T14:20:00'), 
      responsavel: 'Maria Costa',
      observacao: 'Cliente Ana Oliveira'
    },
    { 
      id: '3', 
      tipo: 'entrada', 
      item: 'Fitas Adesivas', 
      quantidade: 50, 
      data: new Date('2024-12-21T16:45:00'), 
      responsavel: 'Pedro Santos'
    },
    { 
      id: '4', 
      tipo: 'saida', 
      item: 'Caixas Grandes', 
      quantidade: 15, 
      data: new Date('2024-12-22T09:15:00'), 
      responsavel: 'João Silva',
      observacao: 'Container #12345'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'entrada' | 'saida'>('entrada');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [responsavel, setResponsavel] = useState('');
  const [observacao, setObservacao] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleMovimentacao = () => {
    if (!selectedItem || quantidade <= 0 || !responsavel) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const itemKey = selectedItem as keyof typeof estoque;
    
    if (dialogType === 'saida' && estoque[itemKey] < quantidade) {
      toast.error('Estoque insuficiente');
      return;
    }

    // Atualizar estoque
    const novoValor = dialogType === 'entrada' 
      ? estoque[itemKey] + quantidade 
      : estoque[itemKey] - quantidade;

    updateEstoque({
      [itemKey]: novoValor,
    });

    // Adicionar movimentação
    const itemNomes: Record<string, string> = {
      caixasPequenas: 'Caixas Pequenas',
      caixasMedias: 'Caixas Médias',
      caixasGrandes: 'Caixas Grandes',
      fitas: 'Fitas Adesivas',
    };

    const novaMovimentacao: Movimentacao = {
      id: Date.now().toString(),
      tipo: dialogType,
      item: itemNomes[selectedItem],
      quantidade,
      data: new Date(),
      responsavel,
      observacao,
    };

    setMovimentacoes([novaMovimentacao, ...movimentacoes]);

    toast.success(
      dialogType === 'entrada' 
        ? 'Entrada registrada com sucesso!' 
        : 'Saída registrada com sucesso!'
    );

    // Reset form
    setSelectedItem('');
    setQuantidade(0);
    setResponsavel('');
    setObservacao('');
    setIsDialogOpen(false);
  };

  const itensEstoque = [
    { 
      key: 'caixasPequenas' as const, 
      nome: 'Caixas Pequenas', 
      cor: 'blue',
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasPequenas,
      ideal: ESTOQUE_IDEAL.caixasPequenas
    },
    { 
      key: 'caixasMedias' as const, 
      nome: 'Caixas Médias', 
      cor: 'green',
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasMedias,
      ideal: ESTOQUE_IDEAL.caixasMedias
    },
    { 
      key: 'caixasGrandes' as const, 
      nome: 'Caixas Grandes', 
      cor: 'purple',
      icon: Package,
      minimo: ESTOQUE_MINIMO.caixasGrandes,
      ideal: ESTOQUE_IDEAL.caixasGrandes
    },
    { 
      key: 'fitas' as const, 
      nome: 'Fitas Adesivas', 
      cor: 'orange',
      icon: Archive,
      minimo: ESTOQUE_MINIMO.fitas,
      ideal: ESTOQUE_IDEAL.fitas
    },
  ];

  const getNivelEstoque = (quantidade: number, minimo: number, ideal: number) => {
    if (quantidade < minimo) return { nivel: 'critico', label: 'Crítico', color: 'red' };
    if (quantidade < minimo * 1.5) return { nivel: 'baixo', label: 'Baixo', color: 'yellow' };
    if (quantidade < ideal) return { nivel: 'medio', label: 'Médio', color: 'blue' };
    return { nivel: 'ideal', label: 'Ideal', color: 'green' };
  };

  const statistics = useMemo(() => {
    const totalItens = Object.values(estoque).reduce((sum, val) => sum + val, 0);
    const itensCriticos = itensEstoque.filter(item => 
      estoque[item.key] < item.minimo
    ).length;
    const itensOk = itensEstoque.filter(item => 
      estoque[item.key] >= item.ideal
    ).length;
    
    const entradas7dias = movimentacoes.filter(m => 
      m.tipo === 'entrada' && 
      Date.now() - m.data.getTime() < 7 * 24 * 60 * 60 * 1000
    ).reduce((sum, m) => sum + m.quantidade, 0);

    const saidas7dias = movimentacoes.filter(m => 
      m.tipo === 'saida' && 
      Date.now() - m.data.getTime() < 7 * 24 * 60 * 60 * 1000
    ).reduce((sum, m) => sum + m.quantidade, 0);

    return { totalItens, itensCriticos, itensOk, entradas7dias, saidas7dias };
  }, [estoque, movimentacoes, itensEstoque]);

  const chartData = itensEstoque.map(item => ({
    nome: item.nome.replace('Caixas ', '').replace('Fitas Adesivas', 'Fitas'),
    atual: estoque[item.key],
    minimo: item.minimo,
    ideal: item.ideal,
    fill: getNivelEstoque(estoque[item.key], item.minimo, item.ideal).color === 'red' 
      ? '#EF4444' 
      : getNivelEstoque(estoque[item.key], item.minimo, item.ideal).color === 'yellow'
      ? '#F59E0B'
      : getNivelEstoque(estoque[item.key], item.minimo, item.ideal).color === 'blue'
      ? '#5DADE2'
      : '#10B981'
  }));

  const distribuicaoData = itensEstoque.map(item => ({
    name: item.nome.replace('Caixas ', '').replace('Fitas Adesivas', 'Fitas'),
    value: estoque[item.key],
    color: item.cor === 'blue' ? '#5DADE2' : item.cor === 'green' ? '#10B981' : item.cor === 'purple' ? '#A855F7' : '#F5A623'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Controle de Estoque</h2>
            <p className="text-muted-foreground mt-1">
              Gerencie caixas, materiais e movimentações
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setDialogType('entrada')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Movimentação</DialogTitle>
                  <DialogDescription>
                    Adicione ou remova itens do estoque
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={dialogType === 'entrada' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setDialogType('entrada')}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Entrada
                    </Button>
                    <Button
                      variant={dialogType === 'saida' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setDialogType('saida')}
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Saída
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Item *</Label>
                    <select
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Selecione...</option>
                      {itensEstoque.map(item => (
                        <option key={item.key} value={item.key}>
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantidade || ''}
                      onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Responsável *</Label>
                    <Input
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Observação</Label>
                    <Textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      placeholder="Informações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleMovimentacao}>
                      Registrar {dialogType === 'entrada' ? 'Entrada' : 'Saída'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Total de Itens</span>
              <Boxes className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{statistics.totalItens}</p>
            <p className="text-xs text-blue-700 mt-1">Unidades em estoque</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-900">Críticos</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-900">{statistics.itensCriticos}</p>
            <p className="text-xs text-red-700 mt-1">Abaixo do mínimo</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Ideais</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{statistics.itensOk}</p>
            <p className="text-xs text-green-700 mt-1">Estoque adequado</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Entradas (7d)</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{statistics.entradas7dias}</p>
            <p className="text-xs text-purple-700 mt-1">Última semana</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-900">Saídas (7d)</span>
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-900">{statistics.saidas7dias}</p>
            <p className="text-xs text-orange-700 mt-1">Última semana</p>
          </Card>
        </div>
      </div>

      {/* Cards de Estoque */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {itensEstoque.map(item => {
          const quantidade = estoque[item.key];
          const nivel = getNivelEstoque(quantidade, item.minimo, item.ideal);
          const percentual = (quantidade / item.ideal) * 100;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`hover:shadow-lg transition-all border-l-4 ${
                nivel.color === 'red' ? 'border-red-500 bg-red-50' :
                nivel.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                nivel.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                'border-green-500 bg-green-50'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.nome}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${
                    nivel.color === 'red' ? 'text-red-600' :
                    nivel.color === 'yellow' ? 'text-yellow-600' :
                    nivel.color === 'blue' ? 'text-blue-600' :
                    'text-green-600'
                  }`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold">{quantidade}</div>
                      <Badge className={
                        nivel.color === 'red' ? 'bg-red-100 text-red-700' :
                        nivel.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        nivel.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {nivel.label}
                      </Badge>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mín: {item.minimo}</span>
                        <span>Ideal: {item.ideal}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            nivel.color === 'red' ? 'bg-red-500' :
                            nivel.color === 'yellow' ? 'bg-yellow-500' :
                            nivel.color === 'blue' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {percentual.toFixed(0)}% do ideal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Níveis */}
        <Card>
          <CardHeader>
            <CardTitle>Níveis de Estoque</CardTitle>
            <CardDescription>
              Comparativo com estoque mínimo e ideal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="nome" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="atual" radius={[8, 8, 0, 0]} />
                <Bar dataKey="minimo" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ideal" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Estoque</CardTitle>
            <CardDescription>
              Proporção de itens por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoData.map((entry, index) => (
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

      {/* Alertas Críticos */}
      {statistics.itensCriticos > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-900">Alertas Críticos</CardTitle>
              </div>
              <CardDescription className="text-red-700">
                Itens que necessitam reposição urgente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itensEstoque.map(item => {
                  const quantidade = estoque[item.key];
                  const nivel = getNivelEstoque(quantidade, item.minimo, item.ideal);
                  
                  if (nivel.nivel !== 'critico') return null;

                  const faltam = item.ideal - quantidade;

                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100">
                          <item.icon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900">{item.nome}</p>
                          <p className="text-sm text-red-700">
                            Estoque: {quantidade} | Mínimo: {item.minimo} | Faltam: {faltam}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setDialogType('entrada');
                          setSelectedItem(item.key);
                          setIsDialogOpen(true);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Repor
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Últimas {movimentacoes.length} movimentações registradas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {movimentacoes.map((mov) => (
                <motion.div
                  key={mov.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    mov.tipo === 'entrada' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-orange-50 border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        mov.tipo === 'entrada' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {mov.tipo === 'entrada' ? (
                          <ArrowUpRight className={`w-4 h-4 ${
                            mov.tipo === 'entrada' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        ) : (
                          <ArrowDownRight className={`w-4 h-4 ${
                            mov.tipo === 'entrada' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{mov.item}</span>
                          <Badge className={
                            mov.tipo === 'entrada' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }>
                            {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                          <span className={`font-bold ${
                            mov.tipo === 'entrada' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{mov.data.toLocaleDateString('pt-BR')} às {mov.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>{mov.responsavel}</span>
                          </div>
                        </div>
                        {mov.observacao && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            Obs: {mov.observacao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {movimentacoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
