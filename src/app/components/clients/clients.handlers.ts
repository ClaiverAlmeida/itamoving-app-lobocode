import type {
  Client,
  ClientHistoryItem,
  ClientsImportResult,
} from '../../api';
import { toast } from 'sonner';
import { BRASIL_STATES } from '../../utils';
import type { ClienteAtividade, HistoricoPaginado, OrigemHistorico } from './clients.constants';

export const formatCepBrasil = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.replace(/(\d{5})(\d{0,3})/, (_, a, b) => (b ? `${a}-${b}` : a));
};

export const mapHistoryToAtividade = (item: ClientHistoryItem): ClienteAtividade => {
  const entityType = (item.entityType ?? '').toLowerCase();
  const actionType = (item.actionType ?? '').toLowerCase();
  let tipo: ClienteAtividade['tipo'] = 'atualizacao';
  let origem: OrigemHistorico = 'client';
  if (entityType === 'client' && actionType === 'created') tipo = 'cadastro';
  else if (entityType === 'client' && actionType === 'updated') tipo = 'atualizacao';
  else if (entityType === 'client' && actionType === 'deleted') tipo = 'exclusao';
  else if (entityType === 'appointment' || entityType === 'agendamento') {
    origem = 'appointment';
    tipo = actionType === 'created' ? 'cadastro' : actionType === 'updated' ? 'atualizacao' : actionType === 'deleted' ? 'exclusao' : 'atualizacao';
  } else if (entityType === 'container') {
    tipo = 'container';
    origem = 'container';
  }
  return {
    id: item.id,
    tipo,
    origem,
    owner: item.owner,
    descricao: item.message,
    data: new Date(item.createdAt),
  };
};

export const loadHistoricoPage = async (args: {
  clientId: string;
  page: number;
  history: (clientId: string, page: number, limit: number) => Promise<any>;
  pageSize: number;
  setLoadingHistoricoId: (id: string | null) => void;
  setHistoricoPorCliente: React.Dispatch<React.SetStateAction<Record<string, HistoricoPaginado>>>;
}) => {
  const { clientId, page, history, pageSize, setLoadingHistoricoId, setHistoricoPorCliente } = args;
  setLoadingHistoricoId(clientId);
  try {
    const res = await history(clientId, page, pageSize);
    if (res.success && res.data) {
      const { data, total, page: p, totalPages } = res.data;
      setHistoricoPorCliente((prev) => ({
        ...prev,
        [clientId]: {
          items: data.map(mapHistoryToAtividade),
          total,
          page: p,
          totalPages,
        },
      }));
    }
  } finally {
    setLoadingHistoricoId(null);
  }
};

export const handleCepBrasilChange = async (args: {
  cep: string;
  setLoadingCep: (loading: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const { cep, setLoadingCep, setFormData } = args;
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return;
  const cepFormatado = cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
  setLoadingCep(true);
  try {
    const result = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await result.json();
    if (!data.erro) {
      const uf = (data.uf || '').trim().toUpperCase();
      const estadoValido = BRASIL_STATES.some((e) => e.uf === uf) ? uf : '';
      const cepExibir =
        data.cep && String(data.cep).trim()
          ? String(data.cep).replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
          : cepFormatado;
      setFormData((prev: any) => ({
        ...prev,
        brazilAddress: {
          ...prev.brazilAddress,
          rua: data.logradouro || '',
          bairro: data.bairro,
          cidade: data.localidade || '',
          estado: estadoValido,
          cep: cepExibir,
        },
      }));
      toast.success('Endereço encontrado!');
    } else {
      toast.error('CEP não encontrado');
      setFormData((prev: any) => ({
        ...prev,
        brazilAddress: { ...prev.brazilAddress, cep: cepFormatado },
      }));
    }
  } catch {
    toast.error('Erro ao buscar CEP');
    setFormData((prev: any) => ({
      ...prev,
      brazilAddress: { ...prev.brazilAddress, cep: cepFormatado },
    }));
  } finally {
    setLoadingCep(false);
  }
};

export const handleDeleteClient = async (args: {
  id: string;
  nome: string;
  remove: (id: string) => Promise<any>;
  deleteCliente: (id: string) => void;
  selectedClienteId?: string;
  setSelectedCliente: (c: Client | null) => void;
}) => {
  const { id, remove, deleteCliente, selectedClienteId, setSelectedCliente } = args;
  const result = await remove(id);
  if (result.success) {
    deleteCliente(id);
    toast.success('Cliente excluído com sucesso!');
    if (selectedClienteId === id) setSelectedCliente(null);
  } else {
    toast.error(result.error || 'Erro ao excluir cliente');
  }
};

export const handleExportClients = async (runExport: () => Promise<any>) => {
  const result = await runExport();
  if (result.success && result.data && !result.data.length) {
    toast.error('Nenhum cliente cadastrado');
    return;
  }
  toast.success('Clientes exportados com sucesso');
};

export const handleImportClients = async (args: {
  file: File | null;
  importClients: (file: File) => Promise<{
    success: boolean;
    data?: ClientsImportResult;
    error?: string;
  }>;
  reloadClientes: () => Promise<void>;
  /** Chamado após importação bem-sucedida (ex.: fechar o diálogo). */
  onDone?: () => void;
}) => {
  const { file, importClients, reloadClientes, onDone } = args;
  if (!file) return toast.error('Nenhum arquivo selecionado');
  const name = file.name.toLowerCase();
  if (!/\.(xlsx|xlsm)$/i.test(name)) {
    return toast.error('Use um arquivo Excel (.xlsx ou .xlsm).');
  }
  const loadingId = toast.loading('Importando clientes…');
  try {
    const result = await importClients(file);
    if (result.success && result.data) {
      const { created, failed, skipped, totalRows, errors } = result.data;
      await reloadClientes();
      onDone?.();
      const base = `Processadas ${totalRows} linha(s): ${created} criado(s)`;
      const skipPart =
        skipped > 0 ? `, ${skipped} ignorado(s) (duplicado no arquivo ou já cadastrado)` : '';
      const failPart = failed > 0 ? `, ${failed} com erro` : '';
      toast.success(`${base}${skipPart}${failPart}.`, { id: loadingId });
      if (errors?.length) {
        const preview = errors
          .slice(0, 5)
          .map((e) => `${e.sheet} linha ${e.row}: ${e.message}`)
          .join('\n');
        toast.message('Alguns registros falharam', {
          description: preview + (errors.length > 5 ? '\n…' : ''),
        });
      }
    } else {
      toast.error(result.error || 'Erro ao importar clientes', { id: loadingId });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao importar clientes';
    toast.error(msg, { id: loadingId });
  }
};

export const handleCallTelephone = (telefones: string[]) => {
  if (!telefones || telefones.length === 0) return toast.error('Nenhum telefone encontrado');
  window.open(`tel:${telefones[0]}`, '_blank');
};

export const handleWhatsappWindow = (telefones: string[]) => {
  if (!telefones || telefones.length === 0) return toast.error('Nenhum telefone encontrado');
  const telefone = telefones[0].trim().replace(/\D/g, '');
  window.open(`https://api.whatsapp.com/send?phone=${telefone}`, '_blank');
};

/** @deprecated use `buildClientUpdatePayload` from `clients.payload` */
export { buildClientUpdatePayload as buildUpdatePayload } from './clients.payload';
