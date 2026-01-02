import { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  MessageCircle, 
  Bot, 
  User, 
  Clock, 
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  LayoutGrid,
  List,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Tag,
  StickyNote,
  ChevronDown,
  X,
  Flame,
  Timer,
  BarChart3,
  Users as UsersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  origem: string;
  destino: string;
  ultimaMensagem: string;
  dataUltimaMensagem: Date;
  status: 'novo' | 'qualificando' | 'orcamento' | 'negociando' | 'fechado' | 'perdido';
  atendidoPorBot: boolean;
  conversas: {
    id: string;
    texto: string;
    remetente: 'cliente' | 'bot' | 'atendente';
    data: Date;
  }[];
  valorEstimado?: number;
  dataMudanca?: string;
  tags?: string[];
  notas?: string;
  prioridade?: 'alta' | 'media' | 'baixa';
}

const mockLeads: Lead[] = [
  {
    id: '1',
    nome: 'Maria Santos',
    telefone: '+1 (305) 123-4567',
    email: 'maria.santos@email.com',
    origem: 'Miami, FL',
    destino: 'São Paulo, SP',
    ultimaMensagem: 'Gostaria de um orçamento para mudança em Março',
    dataUltimaMensagem: new Date('2024-12-21T14:30:00'),
    status: 'novo',
    atendidoPorBot: true,
    valorEstimado: 8500,
    dataMudanca: '2024-03-15',
    tags: ['urgente', 'apt-2-quartos'],
    prioridade: 'alta',
    conversas: [
      { id: '1', texto: 'Olá! Preciso de um orçamento para mudança', remetente: 'cliente', data: new Date('2024-12-21T14:25:00') },
      { id: '2', texto: 'Olá! 👋 Sou a assistente virtual da ITAMOVING. Para um orçamento, preciso de origem, destino, volume e data.', remetente: 'bot', data: new Date('2024-12-21T14:25:30') },
      { id: '3', texto: 'De Miami para São Paulo, tenho um apartamento de 2 quartos', remetente: 'cliente', data: new Date('2024-12-21T14:27:00') },
      { id: '4', texto: 'Gostaria de um orçamento para mudança em Março', remetente: 'cliente', data: new Date('2024-12-21T14:30:00') },
    ]
  },
  {
    id: '2',
    nome: 'João Silva',
    telefone: '+1 (407) 987-6543',
    origem: 'Orlando, FL',
    destino: 'Rio de Janeiro, RJ',
    ultimaMensagem: 'Qual o prazo de entrega?',
    dataUltimaMensagem: new Date('2024-12-21T15:45:00'),
    status: 'qualificando',
    atendidoPorBot: true,
    valorEstimado: 12000,
    dataMudanca: '2024-04-20',
    tags: ['alto-valor'],
    prioridade: 'alta',
    conversas: [
      { id: '1', texto: 'Quanto tempo leva uma mudança de Orlando para Rio?', remetente: 'cliente', data: new Date('2024-12-21T15:30:00') },
      { id: '2', texto: 'Mudanças entre EUA e Brasil levam de 4 a 8 semanas, dependendo da cidade. 🚢⏱️', remetente: 'bot', data: new Date('2024-12-21T15:30:30') },
      { id: '3', texto: 'Qual o prazo de entrega?', remetente: 'cliente', data: new Date('2024-12-21T15:45:00') },
    ]
  },
  {
    id: '3',
    nome: 'Ana Costa',
    telefone: '+1 (786) 555-1234',
    email: 'ana.costa@gmail.com',
    origem: 'Miami, FL',
    destino: 'Belo Horizonte, MG',
    ultimaMensagem: 'Orçamento aprovado! Como faço o pagamento?',
    dataUltimaMensagem: new Date('2024-12-20T16:20:00'),
    status: 'orcamento',
    atendidoPorBot: false,
    valorEstimado: 9500,
    dataMudanca: '2024-05-10',
    tags: ['quase-fechado'],
    prioridade: 'alta',
    conversas: [
      { id: '1', texto: 'Recebi o orçamento por email, está perfeito!', remetente: 'cliente', data: new Date('2024-12-20T16:00:00') },
      { id: '2', texto: 'Que ótimo! Fico feliz que gostou. Como deseja prosseguir?', remetente: 'atendente', data: new Date('2024-12-20T16:05:00') },
      { id: '3', texto: 'Orçamento aprovado! Como faço o pagamento?', remetente: 'cliente', data: new Date('2024-12-20T16:20:00') },
    ]
  },
  {
    id: '4',
    nome: 'Carlos Mendes',
    telefone: '+1 (954) 321-7890',
    origem: 'Fort Lauderdale, FL',
    destino: 'Curitiba, PR',
    ultimaMensagem: 'Vou pensar um pouco mais',
    dataUltimaMensagem: new Date('2024-12-20T11:30:00'),
    status: 'negociando',
    atendidoPorBot: false,
    valorEstimado: 7800,
    tags: ['desconto-solicitado'],
    notas: 'Cliente pediu desconto de 10%. Aguardando aprovação gerente.',
    prioridade: 'media',
    conversas: [
      { id: '1', texto: 'O preço está um pouco acima do que esperava', remetente: 'cliente', data: new Date('2024-12-20T11:00:00') },
      { id: '2', texto: 'Entendo. Posso verificar algumas opções de desconto para você.', remetente: 'atendente', data: new Date('2024-12-20T11:15:00') },
      { id: '3', texto: 'Vou pensar um pouco mais', remetente: 'cliente', data: new Date('2024-12-20T11:30:00') },
    ]
  },
  {
    id: '5',
    nome: 'Patricia Oliveira',
    telefone: '+1 (305) 444-5678',
    email: 'patricia.oli@yahoo.com',
    origem: 'Miami, FL',
    destino: 'Brasília, DF',
    ultimaMensagem: 'Tudo certo! Aguardo a coleta dia 15/01',
    dataUltimaMensagem: new Date('2024-12-19T14:00:00'),
    status: 'fechado',
    atendidoPorBot: false,
    valorEstimado: 11200,
    dataMudanca: '2024-01-15',
    tags: ['vip', 'fechado'],
    prioridade: 'baixa',
    conversas: [
      { id: '1', texto: 'Perfeito! Vou fechar o contrato', remetente: 'cliente', data: new Date('2024-12-19T13:30:00') },
      { id: '2', texto: 'Excelente! Enviei o contrato para assinatura digital.', remetente: 'atendente', data: new Date('2024-12-19T13:35:00') },
      { id: '3', texto: 'Tudo certo! Aguardo a coleta dia 15/01', remetente: 'cliente', data: new Date('2024-12-19T14:00:00') },
    ]
  },
  {
    id: '6',
    nome: 'Roberto Lima',
    telefone: '+1 (407) 888-9999',
    origem: 'Orlando, FL',
    destino: 'Salvador, BA',
    ultimaMensagem: 'Encontrei uma empresa mais barata',
    dataUltimaMensagem: new Date('2024-12-18T10:15:00'),
    status: 'perdido',
    atendidoPorBot: false,
    tags: ['preço'],
    notas: 'Perdeu por preço. Concorrente ofereceu $500 menos.',
    prioridade: 'baixa',
    conversas: [
      { id: '1', texto: 'Obrigado pelo orçamento, mas...', remetente: 'cliente', data: new Date('2024-12-18T10:00:00') },
      { id: '2', texto: 'Encontrei uma empresa mais barata', remetente: 'cliente', data: new Date('2024-12-18T10:15:00') },
    ]
  },
  {
    id: '7',
    nome: 'Fernanda Rocha',
    telefone: '+1 (305) 777-4321',
    origem: 'Miami, FL',
    destino: 'Porto Alegre, RS',
    ultimaMensagem: 'Preciso para urgente!',
    dataUltimaMensagem: new Date('2024-12-22T09:15:00'),
    status: 'novo',
    atendidoPorBot: true,
    valorEstimado: 10500,
    tags: ['urgente'],
    prioridade: 'alta',
    conversas: [
      { id: '1', texto: 'Preciso de mudança urgente! Quando pode ser?', remetente: 'cliente', data: new Date('2024-12-22T09:10:00') },
      { id: '2', texto: 'Preciso para urgente!', remetente: 'cliente', data: new Date('2024-12-22T09:15:00') },
    ]
  },
  {
    id: '8',
    nome: 'Eduardo Martins',
    telefone: '+1 (954) 666-3333',
    origem: 'Fort Lauderdale, FL',
    destino: 'Recife, PE',
    ultimaMensagem: 'Posso parcelar o pagamento?',
    dataUltimaMensagem: new Date('2024-12-21T18:30:00'),
    status: 'qualificando',
    atendidoPorBot: false,
    valorEstimado: 8900,
    tags: ['parcelamento'],
    prioridade: 'media',
    conversas: [
      { id: '1', texto: 'O orçamento ficou bom, mas preciso parcelar', remetente: 'cliente', data: new Date('2024-12-21T18:20:00') },
      { id: '2', texto: 'Posso parcelar o pagamento?', remetente: 'cliente', data: new Date('2024-12-21T18:30:00') },
    ]
  },
];

const statusConfig = {
  novo: { label: 'Novos', color: 'bg-blue-500', icon: AlertCircle },
  qualificando: { label: 'Qualificando', color: 'bg-purple-500', icon: User },
  orcamento: { label: 'Orçamento Enviado', color: 'bg-yellow-500', icon: DollarSign },
  negociando: { label: 'Negociando', color: 'bg-orange-500', icon: MessageCircle },
  fechado: { label: 'Fechado', color: 'bg-green-500', icon: CheckCircle2 },
  perdido: { label: 'Perdido', color: 'bg-red-500', icon: XCircle },
};

const prioridadeConfig = {
  alta: { label: 'Alta', color: 'text-red-600', bg: 'bg-red-50', icon: Flame },
  media: { label: 'Média', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Timer },
  baixa: { label: 'Baixa', color: 'text-slate-600', bg: 'bg-slate-50', icon: Minus },
};

interface DraggableCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void;
}

const DraggableCard = ({ lead, onSelect, onStatusChange }: DraggableCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LEAD',
    item: { id: lead.id, status: lead.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const config = statusConfig[lead.status];
  const prioridadeInfo = lead.prioridade ? prioridadeConfig[lead.prioridade] : null;
  const PrioridadeIcon = prioridadeInfo?.icon;

  const getTempoDecorrido = (data: Date) => {
    const diff = Date.now() - data.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    
    if (horas < 1) {
      const minutos = Math.floor(diff / (1000 * 60));
      return `${minutos}m`;
    }
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    return `${dias}d`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <motion.div
      ref={drag}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="p-4 cursor-move hover:shadow-xl transition-all border-l-4 group relative"
        style={{ borderLeftColor: config.color.replace('bg-', '#').replace('500', '600') }}
        onClick={() => onSelect(lead)}
      >
        {/* Prioridade Badge */}
        {prioridadeInfo && (
          <div className={`absolute -top-2 -right-2 ${prioridadeInfo.bg} rounded-full p-1.5 border-2 border-white shadow-md`}>
            <PrioridadeIcon className={`w-3 h-3 ${prioridadeInfo.color}`} />
          </div>
        )}

        {/* Nome e Badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{lead.nome}</h4>
            <div className="flex items-center gap-1 flex-wrap">
              {lead.atendidoPorBot && (
                <Badge variant="outline" className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  Bot
                </Badge>
              )}
              {lead.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Rota */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.origem} → {lead.destino}</span>
        </div>

        {/* Última Mensagem */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 italic">
          "{lead.ultimaMensagem}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {lead.valorEstimado && (
              <span className="font-semibold text-green-600">
                {formatCurrency(lead.valorEstimado)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{getTempoDecorrido(lead.dataUltimaMensagem)}</span>
          </div>
        </div>

        {/* Quick Actions - aparecem no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
      </Card>
    </motion.div>
  );
};

interface DroppableColumnProps {
  status: Lead['status'];
  children: React.ReactNode;
  onDrop: (leadId: string, newStatus: Lead['status']) => void;
  count: number;
  totalValue: number;
}

const DroppableColumn = ({ status, children, onDrop, count, totalValue }: DroppableColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'LEAD',
    drop: (item: { id: string; status: Lead['status'] }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div
      ref={drop}
      className={`flex-shrink-0 w-80 transition-all duration-200 ${
        isOver ? 'scale-105' : ''
      }`}
    >
      <div className={`mb-4 p-4 rounded-lg ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-white'} transition-all`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
          <h3 className="font-semibold text-foreground">{config.label}</h3>
          <Badge variant="secondary" className="ml-auto">{count}</Badge>
        </div>
        {totalValue > 0 && (
          <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(totalValue)}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 min-h-[500px] bg-slate-50 rounded-lg p-3">
        <AnimatePresence>
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function AtendimentosView() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    prioridade: [] as string[],
    origem: '',
    valorMin: '',
    valorMax: '',
    periodo: 'todos' as 'todos' | 'hoje' | 'semana' | 'mes',
  });
  const [novaNota, setNovaNota] = useState('');

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  const handleAddNota = () => {
    if (!selectedLead || !novaNota.trim()) return;
    
    setLeads(leads.map(lead =>
      lead.id === selectedLead.id
        ? { ...lead, notas: lead.notas ? `${lead.notas}\n\n${novaNota}` : novaNota }
        : lead
    ));
    
    setSelectedLead({ ...selectedLead, notas: selectedLead.notas ? `${selectedLead.notas}\n\n${novaNota}` : novaNota });
    setNovaNota('');
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search
      const matchesSearch = 
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.includes(searchTerm) ||
        lead.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.destino.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Prioridade
      if (filters.prioridade.length > 0 && !filters.prioridade.includes(lead.prioridade || '')) {
        return false;
      }

      // Origem
      if (filters.origem && !lead.origem.toLowerCase().includes(filters.origem.toLowerCase())) {
        return false;
      }

      // Valor
      if (filters.valorMin && lead.valorEstimado && lead.valorEstimado < parseFloat(filters.valorMin)) {
        return false;
      }
      if (filters.valorMax && lead.valorEstimado && lead.valorEstimado > parseFloat(filters.valorMax)) {
        return false;
      }

      // Período
      if (filters.periodo !== 'todos') {
        const now = new Date();
        const leadDate = lead.dataUltimaMensagem;
        
        if (filters.periodo === 'hoje') {
          if (leadDate.toDateString() !== now.toDateString()) return false;
        } else if (filters.periodo === 'semana') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (leadDate < weekAgo) return false;
        } else if (filters.periodo === 'mes') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (leadDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [leads, searchTerm, filters]);

  const getLeadsByStatus = (status: Lead['status']) => {
    return filteredLeads.filter(lead => lead.status === status);
  };

  const getTotalValor = (status: Lead['status']) => {
    return getLeadsByStatus(status).reduce((sum, lead) => sum + (lead.valorEstimado || 0), 0);
  };

  const statistics = useMemo(() => {
    const total = filteredLeads.length;
    const totalValor = filteredLeads.reduce((sum, lead) => sum + (lead.valorEstimado || 0), 0);
    const taxaConversao = total > 0 ? (getLeadsByStatus('fechado').length / total) * 100 : 0;
    const ticketMedio = total > 0 ? totalValor / total : 0;

    return { total, totalValor, taxaConversao, ticketMedio };
  }, [filteredLeads]);

  const getAISuggestion = (lead: Lead): string => {
    const horasDecorridas = Math.floor((Date.now() - lead.dataUltimaMensagem.getTime()) / (1000 * 60 * 60));
    
    if (lead.status === 'novo' && horasDecorridas > 2) {
      return '⚡ Responda urgente! Cliente novo sem resposta há mais de 2h.';
    }
    if (lead.status === 'qualificando' && lead.valorEstimado && lead.valorEstimado > 10000) {
      return '💎 Lead de alto valor! Ofereça atendimento premium.';
    }
    if (lead.status === 'orcamento' && horasDecorridas > 24) {
      return '📞 Follow-up recomendado. Orçamento sem resposta há 1+ dia.';
    }
    if (lead.status === 'negociando' && lead.tags?.includes('desconto-solicitado')) {
      return '💰 Considere oferecer condição especial para fechar.';
    }
    if (lead.prioridade === 'alta') {
      return '🔥 Prioridade alta! Atenda com urgência.';
    }
    
    return '✅ Continue acompanhando normalmente.';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header com Métricas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pipeline de Atendimentos</h1>
              <p className="text-muted-foreground mt-1">
                Gerenciamento de leads do WhatsApp Bot
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <div className="flex gap-1 border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
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
              </div>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Total de Leads</span>
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{statistics.total}</p>
              <p className="text-xs text-blue-700 mt-1">Todos os status</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Valor Total</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(statistics.totalValor)}</p>
              <p className="text-xs text-green-700 mt-1">Pipeline completo</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Taxa de Conversão</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">{statistics.taxaConversao.toFixed(1)}%</p>
              <p className="text-xs text-purple-700 mt-1">Leads fechados</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">Ticket Médio</span>
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">{formatCurrency(statistics.ticketMedio)}</p>
              <p className="text-xs text-orange-700 mt-1">Valor médio/lead</p>
            </Card>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone, origem ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Painel de Filtros Expandido */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Período</label>
                      <select
                        value={filters.periodo}
                        onChange={(e) => setFilters({ ...filters, periodo: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="todos">Todos</option>
                        <option value="hoje">Hoje</option>
                        <option value="semana">Esta Semana</option>
                        <option value="mes">Este Mês</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Prioridade</label>
                      <div className="flex gap-2">
                        {(['alta', 'media', 'baixa'] as const).map((p) => (
                          <Button
                            key={p}
                            variant={filters.prioridade.includes(p) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setFilters({
                                ...filters,
                                prioridade: filters.prioridade.includes(p)
                                  ? filters.prioridade.filter(x => x !== p)
                                  : [...filters.prioridade, p]
                              });
                            }}
                          >
                            {prioridadeConfig[p].label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Origem</label>
                      <Input
                        placeholder="Miami, Orlando..."
                        value={filters.origem}
                        onChange={(e) => setFilters({ ...filters, origem: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Valor Mínimo</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.valorMin}
                        onChange={(e) => setFilters({ ...filters, valorMin: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Valor Máximo</label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={filters.valorMax}
                        onChange={(e) => setFilters({ ...filters, valorMax: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({
                        prioridade: [],
                        origem: '',
                        valorMin: '',
                        valorMax: '',
                        periodo: 'todos',
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

        {/* Pipeline Kanban */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(Object.keys(statusConfig) as Lead['status'][]).map((status) => {
              const leadsDoStatus = getLeadsByStatus(status);
              const totalValue = getTotalValor(status);

              return (
                <DroppableColumn
                  key={status}
                  status={status}
                  count={leadsDoStatus.length}
                  totalValue={totalValue}
                  onDrop={handleStatusChange}
                >
                  {leadsDoStatus.map((lead) => (
                    <DraggableCard
                      key={lead.id}
                      lead={lead}
                      onSelect={setSelectedLead}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </DroppableColumn>
              );
            })}
          </div>
        )}

        {/* Painel Lateral - Detalhes do Lead */}
        <AnimatePresence>
          {selectedLead && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-border p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-foreground">{selectedLead.nome}</h2>
                      {selectedLead.prioridade && (
                        <Badge className={prioridadeConfig[selectedLead.prioridade].bg}>
                          <span className={prioridadeConfig[selectedLead.prioridade].color}>
                            {prioridadeConfig[selectedLead.prioridade].label}
                          </span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={statusConfig[selectedLead.status].color}>
                        {statusConfig[selectedLead.status].label}
                      </Badge>
                      {selectedLead.atendidoPorBot && (
                        <Badge variant="outline">
                          <Bot className="w-3 h-3 mr-1" />
                          Atendimento Bot
                        </Badge>
                      )}
                      {selectedLead.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Sugestão da IA */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-900 mb-1">Sugestão IA</p>
                      <p className="text-sm text-purple-700">{getAISuggestion(selectedLead)}</p>
                    </div>
                  </div>
                </div>

                {/* Informações de Contato */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{selectedLead.telefone}</span>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{selectedLead.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{selectedLead.origem} → {selectedLead.destino}</span>
                  </div>
                  {selectedLead.dataMudanca && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Previsto: {new Date(selectedLead.dataMudanca).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {selectedLead.valorEstimado && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(selectedLead.valorEstimado)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {selectedLead.notas && (
                <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
                  <div className="flex items-start gap-2">
                    <StickyNote className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-1 text-sm">Notas</h3>
                      <p className="text-sm text-yellow-800 whitespace-pre-line">{selectedLead.notas}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Adicionar Nova Nota */}
              <div className="px-6 py-4 border-b border-border bg-slate-50">
                <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  Adicionar Nota
                </h3>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite uma nota sobre este lead..."
                    value={novaNota}
                    onChange={(e) => setNovaNota(e.target.value)}
                    className="flex-1 text-sm"
                    rows={2}
                  />
                  <Button onClick={handleAddNota} size="sm" disabled={!novaNota.trim()}>
                    Salvar
                  </Button>
                </div>
              </div>

              {/* Histórico de Conversas */}
              <div className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Histórico de Conversas
                </h3>
                <div className="space-y-4">
                  {selectedLead.conversas.map((conversa) => (
                    <motion.div
                      key={conversa.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${conversa.remetente === 'cliente' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          conversa.remetente === 'cliente'
                            ? 'bg-[#DCF8C6] text-slate-900'
                            : conversa.remetente === 'bot'
                            ? 'bg-blue-50 text-slate-900 border border-blue-200'
                            : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {conversa.remetente === 'bot' && <Bot className="w-3 h-3 text-blue-600" />}
                          {conversa.remetente === 'atendente' && <User className="w-3 h-3 text-accent" />}
                          <span className="text-xs font-medium">
                            {conversa.remetente === 'cliente'
                              ? selectedLead.nome
                              : conversa.remetente === 'bot'
                              ? 'Bot ITAMOVING'
                              : 'Atendente'}
                          </span>
                        </div>
                        <p className="text-sm">{conversa.texto}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {conversa.data.toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Ações */}
                <div className="mt-6 space-y-2">
                  <Button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Continuar no WhatsApp
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Email
                    </Button>
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}
