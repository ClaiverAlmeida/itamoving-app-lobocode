import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { clientsService, containersServices, stockService, appointmentsService, financialTransactionService } from '../api';
import type { Appointment, Client, Container, Estoque, FinancialTransaction } from '../api';

/** Quais fontes de dados do dashboard devem ser carregadas. Omitir = true (carrega). */
export interface DashboardDataConfig {
  clientes?: boolean;
  containers?: boolean;
  estoque?: boolean;
  agendamentos?: boolean;
  transacoes?: boolean;
}

const defaultConfig: Required<DashboardDataConfig> = {
  clientes: true,
  containers: true,
  estoque: true,
  agendamentos: true,
  transacoes: true,
};

const defaultEstoque: Estoque = {
  smallBoxes: 0,
  mediumBoxes: 0,
  largeBoxes: 0,
  personalizedItems: 0,
  adhesiveTape: 0,
};

export interface UseDashboardDataResult {
  clientes: Client[];
  containers: Container[];
  agendamentos: Appointment[];
  transacoes: FinancialTransaction[];
  estoque: Estoque;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook que carrega em paralelo apenas as requisições habilitadas em `config`.
 * Exemplo: useDashboardData({ clientes: true, estoque: true }) — só busca clientes e estoque.
 */
export function useDashboardData(config: DashboardDataConfig = {}): UseDashboardDataResult {
  const opts = { ...defaultConfig, ...config };
  const cancelledRef = useRef(false);

  const [clientes, setClientes] = useState<Client[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([]);
  const [estoque, setEstoque] = useState<Estoque>(defaultEstoque);
  const [transacoes, setTransacoes] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregar = async () => {
    setIsLoading(true);

    const promises: Promise<unknown>[] = [];
    if (opts.clientes) promises.push(clientsService.getAll());
    if (opts.containers) promises.push(containersServices.getAll());
    if (opts.estoque) promises.push(stockService.getAll());
    if (opts.agendamentos) promises.push(appointmentsService.getAll());
    if (opts.transacoes) promises.push(financialTransactionService.getAll());

    if (promises.length === 0) {
      setIsLoading(false);
      return;
    }

    const results = await Promise.all(promises);
    if (cancelledRef.current) return;

    let idx = 0;
    if (opts.clientes) {
      const res = results[idx++] as Awaited<ReturnType<typeof clientsService.getAll>>;
      if (res.success && res.data) setClientes(res.data);
      else if (res.error) toast.error(res.error);
    }
    if (opts.containers) {
      const res = results[idx++] as Awaited<ReturnType<typeof containersServices.getAll>>;
      if (res.success && res.data) setContainers(res.data);
      else if (res.error) toast.error(res.error);
    }
    if (opts.estoque) {
      const res = results[idx++] as Awaited<ReturnType<typeof stockService.getAll>>;
      if (res.success && res.data?.length) {
        const first = res.data[0];
        setEstoque({
          smallBoxes: first.smallBoxes ?? 0,
          mediumBoxes: first.mediumBoxes ?? 0,
          largeBoxes: first.largeBoxes ?? 0,
          personalizedItems: first.personalizedItems ?? 0,
          adhesiveTape: first.adhesiveTape ?? 0,
        });
      } else if (res.error) toast.error(res.error);
    }
    if (opts.agendamentos) {
      const res = results[idx++] as Awaited<ReturnType<typeof appointmentsService.getAll>>;
      if (res.success && res.data) setAgendamentos(res.data);
      else if (res.error) toast.error(res.error);
    }
    if (opts.transacoes) {
      const res = results[idx++] as Awaited<ReturnType<typeof financialTransactionService.getAll>>;
      if (res.success && res.data) setTransacoes(res.data);
      else if (res.error) toast.error(res.error);
    }
    if (!cancelledRef.current) setIsLoading(false);
  };

  useEffect(() => {
    cancelledRef.current = false;
    carregar();
    return () => {
      cancelledRef.current = true;
    };
  }, [opts.clientes, opts.containers, opts.estoque, opts.agendamentos, opts.transacoes]);

  return {
    clientes,
    containers,
    estoque,
    agendamentos,
    transacoes,
    isLoading,
    refetch: carregar,
  };
}
