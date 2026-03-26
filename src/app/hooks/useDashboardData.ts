import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { clientsService, containersServices, stockService, appointmentsService } from '../api';
import type { Cliente, Container, Estoque, Agendamento } from '../api';

/** Quais fontes de dados do dashboard devem ser carregadas. Omitir = true (carrega). */
export interface DashboardDataConfig {
  clientes?: boolean;
  containers?: boolean;
  estoque?: boolean;
  agendamentos?: boolean;
}

const defaultConfig: Required<DashboardDataConfig> = {
  clientes: true,
  containers: true,
  estoque: true,
  agendamentos: true,
};

const defaultEstoque: Estoque = {
  smallBoxes: 0,
  mediumBoxes: 0,
  largeBoxes: 0,
  personalizedItems: 0,
  adhesiveTape: 0,
};

export interface UseDashboardDataResult {
  clientes: Cliente[];
  containers: Container[];
  agendamentos: Agendamento[];
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

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [estoque, setEstoque] = useState<Estoque>(defaultEstoque);
  const [isLoading, setIsLoading] = useState(true);

  const carregar = async () => {
    setIsLoading(true);

    const promises: Promise<unknown>[] = [];
    if (opts.clientes) promises.push(clientsService.getAll());
    if (opts.containers) promises.push(containersServices.getAll());
    if (opts.estoque) promises.push(stockService.getAll());
    if (opts.agendamentos) promises.push(appointmentsService.getAll());

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

    if (!cancelledRef.current) setIsLoading(false);
  };

  useEffect(() => {
    cancelledRef.current = false;
    carregar();
    return () => {
      cancelledRef.current = true;
    };
  }, [opts.clientes, opts.containers, opts.estoque, opts.agendamentos]);

  return {
    clientes,
    containers,
    agendamentos,
    estoque,
    isLoading,
    refetch: carregar,
  };
}
