import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Alerta, AtividadeRecente, View } from './dashboard/dashboard.constants';
import { DashboardHeaderSection } from './dashboard/components/DashboardHeaderSection';
import { DashboardAlertsSection } from './dashboard/components/DashboardAlertsSection';
import { DashboardPrimaryKpiCardsSection } from './dashboard/components/DashboardPrimaryKpiCardsSection';
import { DashboardSecondaryKpiCardsSection } from './dashboard/components/DashboardSecondaryKpiCardsSection';
import { DashboardChartsSection } from './dashboard/components/DashboardChartsSection';
import { DashboardNextAppointmentsCard } from './dashboard/components/DashboardNextAppointmentsCard';
import {
  Users,
  Calendar,
  Container,
  AlertTriangle,
  Package,
  Truck
} from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useDashboardData, type DashboardDataConfig } from '../hooks/useDashboardData';

interface DashboardViewProps {
  onNavigate?: (view: View) => void;
  /** Quais dados carregar. Omitir = todos. Ex: { clientes: true, agendamentos: true } */
  dataSources?: DashboardDataConfig;
}

export default function DashboardView({ onNavigate, dataSources }: DashboardViewProps = {}) {
  const { transacoes } = useData();
  const { hasPermission } = useAuth();

  const { clientes, containers, agendamentos, estoque } = useDashboardData(dataSources);

  // Cálculos
  const agendamentosHoje = agendamentos.filter(a => {
    const hoje = new Date().toISOString().split('T')[0];
    return a.collectionDate === hoje;
  }).length;

  const agendamentosAmanha = agendamentos.filter(a => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return a.collectionDate === amanha;
  }).length;

  const agendamentosPendentes = agendamentos.filter(a => a.status === 'PENDING').length;

  const receitaTotal = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const despesaTotal = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  const lucro = receitaTotal - despesaTotal;
  const margemLucro = receitaTotal > 0 ? ((lucro / receitaTotal) * 100).toFixed(1) : 0;

  // Normaliza `estoque` pois a API pode retornar campos opcionais/undefined.
  const estoqueSafe = {
    smallBoxes: Number(estoque.smallBoxes ?? 0),
    mediumBoxes: Number(estoque.mediumBoxes ?? 0),
    largeBoxes: Number(estoque.largeBoxes ?? 0),
    personalizedItems: Number(estoque.personalizedItems ?? 0),
    adhesiveTape: Number(estoque.adhesiveTape ?? 0),
  };

  const estoqueTotal =
    estoqueSafe.smallBoxes +
    estoqueSafe.mediumBoxes +
    estoqueSafe.largeBoxes +
    estoqueSafe.adhesiveTape +
    estoqueSafe.personalizedItems;

  const estoqueBaixo = [
    { tipo: 'Caixas Pequenas', qtd: estoqueSafe.smallBoxes, minimo: 50 },
    { tipo: 'Caixas Médias', qtd: estoqueSafe.mediumBoxes, minimo: 30 },
    { tipo: 'Caixas Grandes', qtd: estoqueSafe.largeBoxes, minimo: 20 },
    { tipo: 'Itens Personalizados', qtd: estoqueSafe.personalizedItems, minimo: 10 },
    { tipo: 'Fitas', qtd: estoqueSafe.adhesiveTape, minimo: 40 },
  ].filter(item => item.qtd < item.minimo);

  const containersAtivos = containers.filter(c =>
    c.status === 'PREPARATION' || c.status === 'IN_TRANSIT' || c.status === 'SHIPPED' || c.status === 'DELIVERED' || c.status === 'CANCELLED'
  ).length;

  const containersEmTransito = containers.filter(c => c.status === 'IN_TRANSIT').length;

  const clientesNovosUltimaSemana = clientes.filter(c => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(c.dataCadastro) >= weekAgo;
  }).length;

  // Alertas
  const alertas = useMemo<Alerta[]>(() => {
    const alerts: Alerta[] = [];

    // Agendamentos atrasados
    const atrasados = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.collectionDate + 'T00:00:00');
      return isPast(dataAgendamento) && a.status === 'PENDING' && !isToday(dataAgendamento);
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
            descricao: `Novo cliente cadastrado: ${c.usaNome}`,
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
          descricao: `Agendamento criado para ${a.client.name}`,
          data: new Date(),
          icone: Calendar,
          color: 'green',
        });
      });

    // Containers recentes
    containers
      .slice(0, 2)
      .forEach(c => {
        const dataEmbarque = new Date(c.boardingDate || '');
        // Só adiciona se a data for válida
        if (!isNaN(dataEmbarque.getTime())) {
          atividades.push({
            id: `container-${c.id}`,
            tipo: 'container',
            descricao: `Container ${c.number} - ${c.status === 'PREPARATION' ? 'Em Preparação' : c.status === 'IN_TRANSIT' ? 'Em Trânsito' : c.status === 'DELIVERED' ? 'Entregue' : c.status === 'CANCELLED' ? 'Cancelado' : ''}`,
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
    { name: 'Em Preparação', value: containers.filter(c => c.status === 'PREPARATION').length, color: '#F5A623' },
    { name: 'Em Trânsito', value: containers.filter(c => c.status === 'IN_TRANSIT').length, color: '#5DADE2' },
    { name: 'Entregue', value: containers.filter(c => c.status === 'DELIVERED').length, color: '#10B981' },
    { name: 'Cancelado', value: containers.filter(c => c.status === 'CANCELLED').length, color: '#EF4444' },
  ];

  // Dados para gráfico de estoque
  const estoqueData = [
    { tipo: 'Pequenas', quantidade: estoqueSafe.smallBoxes, fill: '#5DADE2' },
    { tipo: 'Médias', quantidade: estoqueSafe.mediumBoxes, fill: '#F5A623' },
    { tipo: 'Grandes', quantidade: estoqueSafe.largeBoxes, fill: '#1E3A5F' },
    { tipo: 'Itens Personalizados', quantidade: estoqueSafe.personalizedItems, fill: '#94A3B8' },
    { tipo: 'Fitas', quantidade: estoqueSafe.adhesiveTape, fill: '#94A3B8' },
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

  return (
    <div className="space-y-4 lg:space-y-6 overflow-x-hidden">
      {/* Header com saudação */}
      <DashboardHeaderSection
        hasPermission={hasPermission}
        onNavigate={onNavigate}
        formatDate={(d) =>
          format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        }
      />

      {/* Alertas Importantes */}
      {alertas.length > 0 && <DashboardAlertsSection alertas={alertas} onNavigate={onNavigate} />}

      {/* KPI Cards Principais */}
      <DashboardPrimaryKpiCardsSection
        clientes={clientes.length}
        clientesNovosUltimaSemana={clientesNovosUltimaSemana}
        agendamentosHoje={agendamentosHoje}
        agendamentosAmanha={agendamentosAmanha}
        agendamentosPendentes={agendamentosPendentes}
        hasPermissionFinanceiroRead={hasPermission("financeiro", "read")}
        receitaTotal={receitaTotal}
        lucro={lucro}
        margemLucro={String(margemLucro)}
        estoque={estoqueSafe}
        estoqueTotal={estoqueTotal}
        estoqueBaixoCount={estoqueBaixo.length}
        estoqueBaixoLength={estoqueBaixo.length}
        formatCurrency={(v) => formatCurrency(v)}
      />

      {/* KPI Cards Secundários */}
      <DashboardSecondaryKpiCardsSection containersAtivos={containersAtivos} containersEmTransito={containersEmTransito} />

      <DashboardChartsSection
        hasPermissionFinanceiroRead={hasPermission("financeiro", "read")}
        financeiroData={financeiroData}
        containersStatusData={containersStatusData}
        containersAtivos={containersAtivos}
        containersCount={containers.length}
        estoqueData={estoqueData}
        performanceData={performanceData}
        atividadesRecentes={atividadesRecentes}
      />

      <DashboardNextAppointmentsCard agendamentos={agendamentos} onNavigate={onNavigate} />
    </div>
  );
}