import type { Client } from '../../api';
import type { ClientHistoryItem, CreateClientsDTO, UpdateClientsDTO } from '../../api';
import { toast } from 'sonner';
import { BRASIL_STATES } from '../../utils';
import type { ClienteAtividade, HistoricoPaginado, OrigemHistorico } from './clients.constants';
import type { ClientFormData } from './hooks/useClientsForm';

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
  const { id, nome, remove, deleteCliente, selectedClienteId, setSelectedCliente } = args;
  const confirm = window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`);
  if (!confirm) return;
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

export const handleImportClients = async (file: File | null) => {
  if (!file) return toast.error('Nenhum arquivo selecionado');
  const fileType = file.type;
  if (
    fileType !== 'application/json' &&
    fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
    fileType !== 'text/csv'
  ) {
    return toast.error('Formato de arquivo inválido');
  }
  toast.info('Importação de clientes em desenvolvimento');
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

export const buildUpdatePayload = (formData: ClientFormData, editingCliente: Client): UpdateClientsDTO => {
  const current: CreateClientsDTO = {
    usaName: formData.usaName,
    usaCpf: formData.usaCpf,
    usaPhone: formData.usaPhone,
    usaAddress: formData.usaAddress,
    brazilName: formData.brazilName,
    brazilCpf: formData.brazilCpf,
    brazilPhone: formData.brazilPhone,
    brazilAddress: formData.brazilAddress,
    userId: formData.userId,
    status: formData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
  };

  const origUsaAddr = editingCliente.usaAddress as {
    rua?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
    zipCode?: string;
    complemento?: string;
  };
  const origBrAddr = editingCliente.brazilAddress as {
    rua?: string;
    bairro?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
  };
  const patch: UpdateClientsDTO = {};

  if (current.usaName !== editingCliente.usaNome) patch.usaName = current.usaName;
  if (current.usaCpf !== editingCliente.usaCpf) patch.usaCpf = current.usaCpf;
  if (current.usaPhone !== editingCliente.usaPhone) patch.usaPhone = current.usaPhone;
  if (current.brazilName !== editingCliente.brazilNome) patch.brazilName = current.brazilName;
  if (current.brazilCpf !== editingCliente.brazilCpf) patch.brazilCpf = current.brazilCpf;
  if (current.brazilPhone !== editingCliente.brazilPhone) patch.brazilPhone = current.brazilPhone;
  if (current.userId !== (editingCliente.user?.id ?? '')) patch.userId = current.userId;
  if (current.status !== (editingCliente.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE')) patch.status = current.status;

  const usaAddressChanged =
    current.usaAddress.rua !== (origUsaAddr?.rua ?? '') ||
    current.usaAddress.numero !== (origUsaAddr?.numero ?? '') ||
    current.usaAddress.cidade !== (origUsaAddr?.cidade ?? '') ||
    current.usaAddress.estado !== (origUsaAddr?.estado ?? '') ||
    current.usaAddress.zipCode !== (origUsaAddr?.zipCode ?? '') ||
    (current.usaAddress.complemento ?? '') !== (origUsaAddr?.complemento ?? '');
  if (usaAddressChanged) patch.usaAddress = current.usaAddress;

  const brazilDestChanged =
    current.brazilAddress.rua !== (origBrAddr?.rua ?? '') ||
    current.brazilAddress.bairro !== (origBrAddr?.bairro ?? '') ||
    current.brazilAddress.numero !== (origBrAddr?.numero ?? '') ||
    current.brazilAddress.cidade !== (origBrAddr?.cidade ?? '') ||
    current.brazilAddress.estado !== (origBrAddr?.estado ?? '') ||
    current.brazilAddress.cep !== (origBrAddr?.cep ?? '');
  if (brazilDestChanged) patch.brazilAddress = current.brazilAddress;

  return patch;
};
