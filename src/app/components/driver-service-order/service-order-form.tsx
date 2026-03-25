import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { OrdemServicoMotorista, PrecoProduto } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Truck,
  Plus,
  Trash2,
  Save,
  User,
  MapPin,
  Package,
  DollarSign,
  Signature,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  ClipboardList,
  FileText,
} from 'lucide-react';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { toast } from 'sonner';

import { productsService } from '../../services';
import { Caixa, Item, OrdemServicoFormProps, serviceOrderFormService } from '../../services/driver-service-order/service-order-form.service';
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from '../stock';
import { ResponsavelSelect } from '../forms';
import { DriverUser, usersService } from '../../services/hr/users.service';

/** Valor do Select (`SelectItem value`) — igual a `atualizarCaixa` / payload visual. */
function valorSelectCaixa(p: PrecoProduto): string {
  return p.size || p.name;
}

/**
 * Alinha o tipo persistido ao valor do Select (`size` ou `name`).
 * No save, o backend recebe `${size|name} - ${ITEM_LABELS[...]}`; ao abrir de novo precisamos
 * resolver pelo prefixo ou pelo enum `SMALL_BOX`, etc.
 */
function resolveCaixaDisplayType(persistedType: string, produtos: PrecoProduto[]): string {
  const t = String(persistedType ?? '').trim();
  if (!t) return '';
  const ativos = produtos.filter((p) => p.active);

  let match =
    ativos.find((p) => p.type === t) ||
    ativos.find((p) => p.name === t || p.size === t) ||
    ativos.find((p) => valorSelectCaixa(p) === t);

  if (match) return valorSelectCaixa(match);

  const sep = ' - ';
  const idx = t.indexOf(sep);
  if (idx !== -1) {
    const prefix = t.slice(0, idx).trim();
    match =
      ativos.find((p) => p.size === prefix || p.name === prefix) ||
      ativos.find((p) => valorSelectCaixa(p) === prefix);
    if (match) return valorSelectCaixa(match);
  }

  return t;
}

function loadDataUrlOnCanvas(
  dataUrl: string | undefined,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  if (!dataUrl?.startsWith('data:') || !canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = dataUrl;
}

export default function OrdemServicoForm({
  appointmentId,
  agendamento,
  onClose,
  onSave,
  onAgendamentosAtualizados,
  embedded = false,
  existingOrdem,
}: OrdemServicoFormProps) {
  const { user } = useAuth();
  const isEditMode = Boolean(existingOrdem?.id);
  const canvasClienteRef = useRef<HTMLCanvasElement>(null);
  const canvasAgenteRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingCliente, setIsDrawingCliente] = useState(false);
  const [isDrawingAgente, setIsDrawingAgente] = useState(false);
  const [precosProdutos, setPrecosProdutos] = useState<PrecoProduto[]>([]);
  const [motoristas, setMotoristas] = useState<DriverUser[]>([]);
  const [produtosLoading, setProdutosLoading] = useState(false);
  const [motoristasLoading, setMotoristasLoading] = useState(false);
  const [hydrationReady, setHydrationReady] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  // ids dos produtos que já existem no backend (quando estamos em edição)
  // usados para decidir se o PATCH deve enviar `id` (update) ou omitir (create).
  const existingProductIdsRef = useRef<Set<string>>(new Set());

  const carregarMotoristas = async () => {
    setMotoristasLoading(true);
    try {
      const result = await usersService.getAllDrivers();
      if (result.success && result.data) {
        setMotoristas(result.data.data);
      } else if (result.error) {
        toast.error(result.error ?? 'Não foi possível carregar os motoristas.');
      }
    } finally {
      setMotoristasLoading(false);
    }
  };

  const carregarProdutos = async () => {
    setProdutosLoading(true);
    const result = await productsService.getAll();
    try {
      if (result.success && result.data) {
        setPrecosProdutos(result.data);
        return result.data;
      }
      return [] as PrecoProduto[];
    } finally {
      setProdutosLoading(false);
    }
  }

  // Filtrar opções de caixa
  const opcoesCaixa = precosProdutos.filter(
    (p) =>
      (
        p.type === 'SMALL_BOX' ||
        p.type === 'MEDIUM_BOX' ||
        p.type === 'LARGE_BOX' ||
        p.type === 'PERSONALIZED_ITEM' ||
        p.type === 'TAPE_ADHESIVE'
      ) &&
      p.active,
  );

  // Estados do formulário - Remetente (USA)
  const [remetenteNome, setRemetenteNome] = useState(agendamento.client.usaName || '');
  const [remetenteTel, setRemetenteTel] = useState(agendamento.client.usaPhone || '');
  const [remetenteEndereco, setRemetenteEndereco] = useState(agendamento.client.usaAddress.rua || '');
  const [remetenteCidade, setRemetenteCidade] = useState(agendamento.client.usaAddress.cidade || '');
  const [remetenteEstado, setRemetenteEstado] = useState(agendamento.client.usaAddress.estado || '');
  const [remetenteZipCode, setRemetenteZipCode] = useState(agendamento.client.usaAddress.zipCode || '');
  const [remetenteNumero, setRemetenteNumero] = useState(agendamento.client.usaAddress.numero || '');
  const [remetenteComplemento, setRemetenteComplemento] = useState(agendamento.client.usaAddress.complemento || '');
  const [remetenteCpfRg, setRemetenteCpfRg] = useState(agendamento.client.usaCpf || '');

  // Estados do formulário - Destinatário (Brasil)
  const [destinatarioNome, setDestinatarioNome] = useState(agendamento.client.brazilName || '');
  const [destinatarioCpfRg, setDestinatarioCpfRg] = useState(agendamento.client.brazilCpf || '');
  const [destinatarioEndereco, setDestinatarioEndereco] = useState(agendamento.client.brazilAddress.rua || '');
  const [destinatarioBairro, setDestinatarioBairro] = useState(agendamento.client.brazilAddress.bairro || '');
  const [destinatarioCidade, setDestinatarioCidade] = useState(agendamento.client.brazilAddress.cidade || '');
  const [destinatarioEstado, setDestinatarioEstado] = useState(agendamento.client.brazilAddress.estado || '');
  const [destinatarioCep, setDestinatarioCep] = useState(agendamento.client.brazilAddress.cep || '');
  const [destinatarioTelefone, setDestinatarioTelefone] = useState(agendamento.client.brazilPhone || '');
  const [destinatarioNumero, setDestinatarioNumero] = useState(agendamento.client.brazilAddress.numero || '');
  const [destinatarioComplemento, setDestinatarioComplemento] = useState(agendamento.client.brazilAddress.complemento || '');

  // Estados para caixas
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  // Estados para itens
  const [itens, setItens] = useState<Item[]>([]);

  // Estados para assinaturas
  const [assinaturaCliente, setAssinaturaCliente] = useState('');
  const [assinaturaAgente, setAssinaturaAgente] = useState('');
  // Evita que clique/soltar sem desenhar gere `toDataURL()` e burle a validação.
  const clienteAssinaturaDirtyRef = useRef(false);
  // Evita que clique/soltar sem desenhar gere `toDataURL()` e burle a validação.
  const agenteAssinaturaDirtyRef = useRef(false);

  // Estado para valor pago
  const [valorPago, setValorPago] = useState('0.00');

  const [observations, setObservations] = useState('');

  const [ordemStatus, setOrdemStatus] = useState<OrdemServicoMotorista['status']>('COMPLETED');
  const [ordemObservacoes, setOrdemObservacoes] = useState('');
  const [motoristaResponsavel, setMotoristaResponsavel] = useState('');
  // `motoristaResponsavel` é o `id` do motorista usado no `ResponsavelSelect`.
  const motoristaResponsavelNome = motoristas.find((m) => m.id === motoristaResponsavel)?.name;

  // Calcular valor total das caixas
  const valorTotalCaixas = caixas.reduce((sum, c) => sum + c.value, 0);

  const renumerarCaixas = (lista: Caixa[]) =>
    lista.map((caixa, index) => ({
      ...caixa,
      number: '',
    }));

  const novoIdItem = () =>
    `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  /** Mesma regra usada ao salvar a ordem: tipo, nº, valor e peso válidos. */
  const caixaTemTodosCamposPreenchidos = (c: Caixa) => {
    const tipoValido = Boolean(String(c.type ?? '').trim());
    const valorValido = Number.isFinite(Number(c.value)) && Number(c.value) > 0;
    const pesoValido = Number.isFinite(Number(c.weight)) && Number(c.weight) > 0;
    return tipoValido && valorValido && pesoValido;
  };

  const obterTipoProdutoDaCaixa = (caixa: Caixa) => {
    const produtoDaCaixa = opcoesCaixa.find(
      (p) => p.type === caixa.type || p.name === caixa.type || p.size === caixa.type,
    );
    return produtoDaCaixa?.type;
  };

  const isFitaAdesiva = (caixa: Caixa) => obterTipoProdutoDaCaixa(caixa) === 'TAPE_ADHESIVE';

  const isCaixaPersonalizada = (caixa: Caixa) =>
    obterTipoProdutoDaCaixa(caixa) === 'PERSONALIZED_ITEM';

  // Adicionar caixa
  const adicionarCaixa = async () => {
    const produtos = await carregarProdutos();

    const opcoesAtivas = produtos.filter(
      (p) =>
        (
          p.type === 'SMALL_BOX' ||
          p.type === 'MEDIUM_BOX' ||
          p.type === 'LARGE_BOX' ||
          p.type === 'PERSONALIZED_ITEM' ||
          p.type === 'TAPE_ADHESIVE'
        ) &&
        p.active,
    );

    if (opcoesAtivas.length === 0) {
      toast.info('Não há produtos ativos para adicionar caixas, cadastre um produto para continuar');
      return;
    }

    setCaixas((prev) =>
      renumerarCaixas([
        ...prev,
        {
          id: Date.now().toString(),
          type: '',
          number: '',
          value: 0,
          weight: 0,
        },
      ]),
    );
  };

  // Atualizar caixa
  const atualizarCaixa = (id: string, campo: keyof Caixa, valor: string | number) => {
    setCaixas(caixas.map(c => {
      if (c.id !== id) return c;

      const novaCaixa = { ...c, [campo]: valor };

      // Se alterou o tipo, busca o preço
      if (campo === 'type') {
        const produto = opcoesCaixa.find(p => p.size === valor || p.name === valor);
        if (produto) {
          novaCaixa.value = produto.salePrice;
          novaCaixa.weight = produto.maxWeight ?? 0;
        }
      }

      return novaCaixa;
    }));
  };

  // Remover caixa
  const removerCaixa = (id: string) => {
    setItens((prev) => prev.filter((i) => i.caixaId !== id));
    setCaixas((prev) => renumerarCaixas(prev.filter((c) => c.id !== id)));
  };

  const adicionarItens = (caixaId: string) => {
    const caixa = caixas.find((c) => c.id === caixaId);
    if (!caixa || !caixaTemTodosCamposPreenchidos(caixa)) {
      toast.error('Preencha tipo, peso e valor da caixa antes de adicionar itens');
      return;
    }
    setItens((prev) => [
      ...prev,
      {
        id: novoIdItem(),
        caixaId,
        name: '',
        quantity: 0,
        weight: 0,
        observations: '',
      },
    ]);
  };

  const atualizarItem = (id: string, campo: keyof Item, valor: string | number) => {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)),
    );
  };

  const removerItens = (id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  // Funções de desenho da assinatura - Cliente
  const startDrawingCliente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasClienteRef.current;
    if (!canvas) return;

    setIsDrawingCliente(true);
    clienteAssinaturaDirtyRef.current = false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawCliente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingCliente) return;

    const canvas = canvasClienteRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    clienteAssinaturaDirtyRef.current = true;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingCliente = () => {
    setIsDrawingCliente(false);
    const canvas = canvasClienteRef.current;
    if (canvas) {
      // Só atualiza o estado se o usuário realmente desenhou.
      // Isso evita que eventos `mouseUp`/`touchEnd` sem `startDrawing` zerem a assinatura.
      if (clienteAssinaturaDirtyRef.current) setAssinaturaCliente(canvas.toDataURL());
    }
  };

  const limparAssinaturaCliente = () => {
    const canvas = canvasClienteRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaCliente('');
    clienteAssinaturaDirtyRef.current = false;
  };

  // Funções de desenho da assinatura - Agente
  const startDrawingAgente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasAgenteRef.current;
    if (!canvas) return;

    setIsDrawingAgente(true);
    agenteAssinaturaDirtyRef.current = false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawAgente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingAgente) return;

    const canvas = canvasAgenteRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    agenteAssinaturaDirtyRef.current = true;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingAgente = () => {
    setIsDrawingAgente(false);
    const canvas = canvasAgenteRef.current;
    if (canvas) {
      // Só atualiza o estado se o usuário realmente desenhou.
      // Isso evita que eventos `mouseUp`/`touchEnd` sem `startDrawing` zerem a assinatura.
      if (agenteAssinaturaDirtyRef.current) setAssinaturaAgente(canvas.toDataURL());
    }
  };

  const limparAssinaturaAgente = () => {
    const canvas = canvasAgenteRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaAgente('');
    agenteAssinaturaDirtyRef.current = false;
  };

  useEffect(() => {
    void carregarProdutos();
  }, []);

  useEffect(() => {
    void carregarMotoristas();
  }, []);

  /** Criação por motorista: o responsável é sempre o próprio usuário (select desabilitado). */
  useEffect(() => {
    if (existingOrdem?.id) return;
    if (user?.role === 'motorista' && user?.id) {
      setMotoristaResponsavel(user.id);
    }
  }, [appointmentId, existingOrdem?.id, user?.role, user?.id]);

  const hydratedKeyRef = useRef<string>('');

  // Ao trocar de ordem em edição, zera o snapshot/estado de prontidão
  useEffect(() => {
    setInitialSnapshot(null);
    setHydrationReady(false);
  }, [existingOrdem?.id]);

  /** Nova ordem (motorista): limpa assinaturas ao trocar agendamento. Em edição, o efeito seguinte preenche. */
  useEffect(() => {
    if (existingOrdem?.id) return;

    const clearCanvas = (c: HTMLCanvasElement | null) => {
      if (!c) return;
      c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    };

    clearCanvas(canvasClienteRef.current);
    clearCanvas(canvasAgenteRef.current);
    setAssinaturaCliente('');
    setAssinaturaAgente('');
    setHydrationReady(false);
    setInitialSnapshot(null);
    existingProductIdsRef.current = new Set();
    clienteAssinaturaDirtyRef.current = false;
    agenteAssinaturaDirtyRef.current = false;
  }, [appointmentId, existingOrdem?.id]);

  /** Edição (back-office): hidrata formulário quando a ordem existe (catálogo de produtos pode carregar depois). */
  useEffect(() => {
    if (!existingOrdem?.id) return;

    const nProdutos = existingOrdem.driverServiceOrderProducts?.length ?? 0;
    const key = `${existingOrdem.id}:${precosProdutos.length}:${nProdutos}`;
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    const prods = precosProdutos.filter(
      (p) =>
        (p.type === 'SMALL_BOX' ||
          p.type === 'MEDIUM_BOX' ||
          p.type === 'LARGE_BOX' ||
          p.type === 'PERSONALIZED_ITEM' ||
          p.type === 'TAPE_ADHESIVE') &&
        p.active,
    );

    setRemetenteNome(existingOrdem.sender.usaName || '');
    setRemetenteTel(existingOrdem.sender.usaPhone || '');
    setRemetenteEndereco(existingOrdem.sender.usaAddress.rua || '');
    setRemetenteCidade(existingOrdem.sender.usaAddress.cidade || '');
    setRemetenteEstado(existingOrdem.sender.usaAddress.estado || '');
    setRemetenteZipCode(existingOrdem.sender.usaAddress.zipCode || '');
    setRemetenteNumero(existingOrdem.sender.usaAddress.numero || '');
    setRemetenteComplemento(existingOrdem.sender.usaAddress.complemento?.trim() || '-');
    setRemetenteCpfRg(existingOrdem.sender.usaCpf || '');

    setDestinatarioNome(existingOrdem.recipient.brazilName || '');
    setDestinatarioCpfRg(existingOrdem.recipient.brazilCpf || '');
    setDestinatarioEndereco(existingOrdem.recipient.brazilAddress.rua || '');
    setDestinatarioBairro(existingOrdem.recipient.brazilAddress.bairro || '');
    setDestinatarioCidade(existingOrdem.recipient.brazilAddress.cidade || '');
    setDestinatarioEstado(existingOrdem.recipient.brazilAddress.estado || '');
    setDestinatarioCep(existingOrdem.recipient.brazilAddress.cep || '');
    setDestinatarioTelefone(existingOrdem.recipient.brazilPhone || '');
    setDestinatarioNumero(existingOrdem.recipient.brazilAddress.numero || '');
    setDestinatarioComplemento(
      existingOrdem.recipient.brazilAddress.complemento?.trim() || '-',
    );

    setOrdemStatus(existingOrdem.status);
    setOrdemObservacoes(existingOrdem.observations ?? '');
    // `ResponsavelSelect` trabalha com `id` (userId do motorista).
    setMotoristaResponsavel(existingOrdem.userId || '');

    existingProductIdsRef.current = new Set(
      (existingOrdem.driverServiceOrderProducts ?? [])
        .map((p) => p.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    );

    const hydratedCaixas = renumerarCaixas(
      existingOrdem.driverServiceOrderProducts.map((p) => ({
        id: p.id!,
        type: resolveCaixaDisplayType(p.type, prods),
        number: '',
        value: p.value,
        weight: p.weight,
      })),
    );
    setCaixas(hydratedCaixas);

    const mappedItens: Item[] = [];
    for (const p of existingOrdem.driverServiceOrderProducts) {
      for (const it of p.driverServiceOrderProductsItems ?? []) {
        mappedItens.push({
          // Mantém o id do item existente (se vier do backend) para permitir PATCH incremental.
          // Para itens novos (quando não houver existingOrdem), usamos id local.
          id: it.id ?? novoIdItem(),
          caixaId: p.id!,
          name: it.name,
          quantity: it.quantity,
          weight: it.weight,
          observations: it.observations ?? '',
        });
      }
    }
    setItens(mappedItens);

    const cv = existingOrdem.chargedValue ?? 0;
    const valorPagoInicial = Number.isFinite(Number(cv)) ? String(cv) : '0';
    setValorPago(valorPagoInicial);

    const sigC = existingOrdem.clientSignature || '';
    const sigA = existingOrdem.agentSignature || '';
    setAssinaturaCliente(sigC);
    setAssinaturaAgente(sigA);

    requestAnimationFrame(() => {
      loadDataUrlOnCanvas(sigC, canvasClienteRef);
      loadDataUrlOnCanvas(sigA, canvasAgenteRef);
      // Só consideramos a hidratação "pronta" para o dirty-check quando os preços
      // já foram carregados (senão o resolveCaixaDisplayType pode mudar depois).
      if (precosProdutos.length > 0) setHydrationReady(true);
      else setHydrationReady(false);
    });
  }, [existingOrdem, precosProdutos]);

  // Garanta que o `value` do select corresponda ao `id` do motorista.
  // Isso evita abrir a tela de edição com placeholder quando:
  // - o GET vier com `driverName` (nome) e não com `id`; ou
  // - o carregamento de motoristas chegar depois da hidratação.
  useEffect(() => {
    if (!existingOrdem?.id) return;
    if (!motoristas.length) return;

    const matchesId = motoristas.some((m) => m.id === motoristaResponsavel);
    if (matchesId) return;

    const matchByName = motoristas.find((m) => m.name === existingOrdem.driverName);
    if (matchByName) setMotoristaResponsavel(matchByName.id);
  }, [existingOrdem?.id, existingOrdem?.driverName, motoristas, motoristaResponsavel]);

  const editSnapshot = useMemo(() => {
    if (!isEditMode) return null;

    return JSON.stringify({
      remetente: {
        usaName: remetenteNome,
        usaPhone: remetenteTel,
        usaCpf: remetenteCpfRg,
        usaAddress: {
          rua: remetenteEndereco,
          numero: remetenteNumero,
          cidade: remetenteCidade,
          estado: remetenteEstado,
          zipCode: remetenteZipCode,
          complemento: remetenteComplemento,
        },
      },
      destinatario: {
        brazilName: destinatarioNome,
        brazilCpf: destinatarioCpfRg,
        brazilPhone: destinatarioTelefone,
        brazilAddress: {
          rua: destinatarioEndereco,
          bairro: destinatarioBairro,
          cidade: destinatarioCidade,
          estado: destinatarioEstado,
          cep: destinatarioCep,
          complemento: destinatarioComplemento,
          numero: destinatarioNumero,
        },
      },
      ordem: {
        status: ordemStatus,
        observations: ordemObservacoes.trim(),
        chargedValue: valorPago,
      },
      motoristaResponsavel,
      assinaturas: {
        clientSignature: assinaturaCliente.trim(),
        agentSignature: assinaturaAgente.trim(),
      },
      caixas: caixas.map((c) => ({
        id: c.id,
        type: c.type,
        value: c.value,
        weight: c.weight,
      })),
      itens: itens.map((i) => ({
        id: i.id,
        caixaId: i.caixaId,
        name: i.name,
        quantity: i.quantity,
        weight: i.weight,
        observations: i.observations ?? '',
      })),
    });
  }, [
    isEditMode,
    remetenteNome,
    remetenteTel,
    remetenteCpfRg,
    remetenteEndereco,
    remetenteNumero,
    remetenteCidade,
    remetenteEstado,
    remetenteZipCode,
    remetenteComplemento,
    destinatarioNome,
    destinatarioCpfRg,
    destinatarioTelefone,
    destinatarioEndereco,
    destinatarioBairro,
    destinatarioCidade,
    destinatarioEstado,
    destinatarioCep,
    destinatarioComplemento,
    destinatarioNumero,
    ordemStatus,
    ordemObservacoes,
    valorPago,
    motoristaResponsavel,
    assinaturaCliente,
    assinaturaAgente,
    caixas,
    itens,
  ]);

  const isDirty = useMemo(() => {
    if (!isEditMode) return true;
    if (!initialSnapshot || !editSnapshot) return false;
    return editSnapshot !== initialSnapshot;
  }, [isEditMode, initialSnapshot, editSnapshot]);

  const canSave = useMemo(() => {
    if (!isEditMode) return true;
    return Boolean(initialSnapshot) && Boolean(editSnapshot) && isDirty;
  }, [isEditMode, initialSnapshot, editSnapshot, isDirty]);

  // Snapshot inicial (dirty-check) deve ser capturado SOMENTE quando:
  // - a ordem terminou de hidratar
  // - os motoristas terminaram de carregar
  // - o `motoristaResponsavel` já está resolvido para o id esperado
  useEffect(() => {
    if (!isEditMode) return;
    if (!existingOrdem?.id) return;
    if (!hydrationReady) return;
    if (motoristasLoading) return;
    if (produtosLoading) return;
    if (initialSnapshot) return;
    if (!editSnapshot) return;

    // Garanta que assinaturas e produtos/itens já estão 100% carregados.
    const expectedClientSig = String(existingOrdem.clientSignature ?? '').trim();
    const expectedAgentSig = String(existingOrdem.agentSignature ?? '').trim();
    if (assinaturaCliente.trim() !== expectedClientSig) return;
    if (assinaturaAgente.trim() !== expectedAgentSig) return;

    const expectedCaixasCount = existingOrdem.driverServiceOrderProducts?.length ?? 0;
    if (caixas.length !== expectedCaixasCount) return;

    const expectedItensCount = (existingOrdem.driverServiceOrderProducts ?? []).reduce(
      (sum, p) => sum + (p.driverServiceOrderProductsItems?.length ?? 0),
      0,
    );
    if (itens.length !== expectedItensCount) return;

    let expectedMotoristaId = existingOrdem.userId || '';
    if (motoristas.length) {
      const matchByName = motoristas.find((m) => m.name === existingOrdem.driverName);
      if (matchByName) expectedMotoristaId = matchByName.id;
    }

    if (motoristaResponsavel !== expectedMotoristaId) return;

    setInitialSnapshot(editSnapshot);
  }, [
    isEditMode,
    existingOrdem?.id,
    existingOrdem?.userId,
    existingOrdem?.driverName,
    hydrationReady,
    motoristasLoading,
    produtosLoading,
    initialSnapshot,
    editSnapshot,
    motoristaResponsavel,
    motoristas,
    assinaturaCliente,
    assinaturaAgente,
    caixas,
    itens,
  ]);

  // Salvar ordem de serviço
  const salvarOrdemServico = async () => {
    if (isEditMode && !canSave) {
      toast.info('Nenhum campo alterado.');
      return;
    }
    // Validações básicas
    if (!remetenteNome || !remetenteTel || !remetenteEndereco || !remetenteNumero || !remetenteCidade || !remetenteEstado || !remetenteZipCode || !remetenteComplemento) {
      toast.error('Preencha todos os campos obrigatórios do remetente');
      return;
    }

    if (!destinatarioNome || !destinatarioCpfRg || !destinatarioEndereco || !destinatarioBairro || !destinatarioCidade || !destinatarioEstado || !destinatarioCep || !destinatarioTelefone || !destinatarioNumero || !destinatarioComplemento) {
      toast.error('Preencha todos os campos obrigatórios do destinatário');
      return;
    }

    if (caixas.length === 0) {
      toast.error('Adicione pelo menos uma caixa ou produto');
      return;
    }

    const caixaInvalida = caixas.some((c) => !caixaTemTodosCamposPreenchidos(c));

    if (caixaInvalida) {
      toast.error('Preencha todos os campos das caixas ou produtos antes de salvar');
      return;
    }

    const caixaSemItensObrigatorios = caixas.some((c) => {
      if (isFitaAdesiva(c) || isCaixaPersonalizada(c)) return false;
      const itensDaCaixa = itens.filter((i) => i.caixaId === c.id);
      return itensDaCaixa.length === 0;
    });

    if (caixaSemItensObrigatorios) {
      toast.error('Cada caixa precisa ter ao menos 1 item (fita adesiva e caixa personalizada não exigem itens)');
      return;
    }

    const itemInvalido = itens.some((i) => {
      const nameValido = Boolean(String(i.name ?? '').trim());
      const quantidadeValida = Number.isFinite(Number(i.quantity)) && Number(i.quantity) > 0;
      const pesoValido = Number.isFinite(Number(i.weight)) && Number(i.weight) > 0;
      return !nameValido || !quantidadeValida || !pesoValido;
    });

    if (itemInvalido) {
      toast.error('Preencha todos os campos dos itens antes de salvar');
      return;
    }

    const assinaturaClienteFinal =
      assinaturaCliente?.trim() ||
      (isEditMode ? (existingOrdem?.clientSignature ?? '') : '');
    const assinaturaAgenteFinal =
      assinaturaAgente?.trim() ||
      (isEditMode ? (existingOrdem?.agentSignature ?? '') : '');

    if (!assinaturaClienteFinal) {
      toast.error('É necessária a assinatura do cliente');
      return;
    }

    if (!assinaturaAgenteFinal) {
      toast.error('É necessária a assinatura do agente');
      return;
    }

    if (ordemStatus === 'COMPLETED' && Number(valorPago) <= 0) {
      toast.error('Para ordem concluída, informe o valor recebido.');
      return;
    }
    if (!isEditMode && Number(valorPago) <= 0) {
      toast.error('O valor pago deve ser maior que 0');
      return;
    }

    const criandoComoMotorista = !isEditMode && user?.role === 'motorista';

    let idMotoristaResponsavel: string;

    if (criandoComoMotorista) {
      const uid = String(user?.id ?? '').trim();
      if (!uid) {
        toast.error('Sessão inválida. Faça login novamente.');
        return;
      }
      idMotoristaResponsavel = uid;
    } else {
      if (motoristasLoading) {
        toast.error('Aguarde o carregamento da lista de motoristas.');
        return;
      }

      if (!motoristas.length) {
        toast.error('Não há motoristas disponíveis. Tente novamente em instantes.');
        return;
      }

      idMotoristaResponsavel = String(motoristaResponsavel ?? '').trim();
      if (!idMotoristaResponsavel) {
        toast.error('Selecione um motorista responsável');
        return;
      }

      const motoristaNaLista = motoristas.some((m) => m.id === idMotoristaResponsavel);
      if (!motoristaNaLista) {
        const motoristaEhUsuarioLogado =
          isEditMode && user?.role === 'motorista' && idMotoristaResponsavel === user?.id;
        if (!motoristaEhUsuarioLogado) {
          toast.error(
            'Selecione um motorista válido na lista. O valor atual não corresponde a um motorista (ex.: ordem criada por admin — escolha o motorista no campo).',
          );
          return;
        }
      }
    }

    const payload: OrdemServicoMotorista = {
      appointmentId,
      sender: {
        usaName: remetenteNome,
        usaPhone: remetenteTel,
        usaCpf: remetenteCpfRg,
        usaAddress: {
          rua: remetenteEndereco,
          numero: remetenteNumero,
          cidade: remetenteCidade,
          estado: remetenteEstado,
          zipCode: remetenteZipCode,
          complemento: remetenteComplemento,
        },
      },
      recipient: {
        brazilName: destinatarioNome,
        brazilCpf: destinatarioCpfRg,
        brazilAddress: {
          rua: destinatarioEndereco,
          bairro: destinatarioBairro,
          cidade: destinatarioCidade,
          estado: destinatarioEstado,
          cep: destinatarioCep,
          complemento: destinatarioComplemento,
          numero: destinatarioNumero,
        },
        brazilPhone: destinatarioTelefone,
      },
      driverServiceOrderProducts: caixas.map((c) => ({
        // Quando o produto (caixa) já existe no backend, enviamos `id` para permitir update.
        // Quando for criado durante a edição, omitimos `id` para o backend criar um novo record.
        ...(existingProductIdsRef.current.has(c.id) ? { id: c.id } : {}),
        type: `${c.type} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[obterTipoProdutoDaCaixa(c) as keyof typeof PRODUCT_TYPE_TO_ITEM_KEY]]}`,
        value: c.value,
        weight: c.weight,
        driverServiceOrderProductsItems: itens
          .filter((i) => i.caixaId === c.id)
          .map((i) => ({
            id: i.id,
            name: i.name,
            quantity: Number(i.quantity) || 0,
            weight: Number(i.weight) || 0,
            observations: i.observations ?? '',
          })),
      })),
      clientSignature: assinaturaClienteFinal,
      agentSignature: assinaturaAgenteFinal,
      signatureDate: new Date().toISOString(),
      driverName: isEditMode
        ? (motoristaResponsavelNome || existingOrdem?.driverName || user?.nome || 'Motorista')
        : criandoComoMotorista
          ? (user?.nome || 'Motorista')
          : (motoristaResponsavelNome || 'Motorista'),
      userId: idMotoristaResponsavel,
      status: criandoComoMotorista ? 'COMPLETED' : ordemStatus,
      chargedValue: parseFloat(valorPago),
      observations: !isEditMode ? observations : ordemObservacoes.trim() || undefined,
    };

    if (isEditMode && existingOrdem?.id) {
      if (!initialSnapshot || !editSnapshot) {
        toast.info('Nenhum campo alterado.');
        return;
      }

      let initialObj: any = null;
      let currentObj: any = null;
      try {
        initialObj = JSON.parse(initialSnapshot);
        currentObj = JSON.parse(editSnapshot);
      } catch {
        // Fallback: se algo falhar ao parsear, não envia atualização parcial (evita PATCH incorreto).
        toast.error('Erro ao comparar campos alterados. Tente novamente.');
        return;
      }

      const patch: Partial<OrdemServicoMotorista> = {};

      const remetenteChanged = JSON.stringify(currentObj?.remetente) !== JSON.stringify(initialObj?.remetente);
      const destinatarioChanged = JSON.stringify(currentObj?.destinatario) !== JSON.stringify(initialObj?.destinatario);

      const statusChanged = currentObj?.ordem?.status !== initialObj?.ordem?.status;
      const observationsChanged = currentObj?.ordem?.observations !== initialObj?.ordem?.observations;
      const chargedValueChanged = currentObj?.ordem?.chargedValue !== initialObj?.ordem?.chargedValue;

      const clientSignatureChanged = currentObj?.assinaturas?.clientSignature !== initialObj?.assinaturas?.clientSignature;
      const agentSignatureChanged = currentObj?.assinaturas?.agentSignature !== initialObj?.assinaturas?.agentSignature;

      const caixasChanged = JSON.stringify(currentObj?.caixas) !== JSON.stringify(initialObj?.caixas);
      const itensChanged = JSON.stringify(currentObj?.itens) !== JSON.stringify(initialObj?.itens);

      if (remetenteChanged) patch.sender = payload.sender;
      if (destinatarioChanged) patch.recipient = payload.recipient;

      if (statusChanged) patch.status = payload.status;
      if (observationsChanged) patch.observations = currentObj?.ordem?.observations ?? '';
      if (chargedValueChanged) patch.chargedValue = payload.chargedValue;

      // Assinaturas
      if (clientSignatureChanged) patch.clientSignature = payload.clientSignature;
      if (agentSignatureChanged) patch.agentSignature = payload.agentSignature;
      // Só atualiza `signatureDate` quando a assinatura foi alterada (desenho/alteração no frontend).
      // Se o usuário não mexeu nas assinaturas, mantemos a data original no backend.
      if (clientSignatureChanged || agentSignatureChanged) {
        patch.signatureDate = payload.signatureDate;
      }

      // Produtos/itens (só quando caixas ou itens realmente mudaram)
      if (caixasChanged || itensChanged) {
        const initialCaixas: Array<any> = initialObj?.caixas ?? [];
        const currentCaixas: Array<any> = currentObj?.caixas ?? [];
        const initialItens: Array<any> = initialObj?.itens ?? [];
        const currentItens: Array<any> = currentObj?.itens ?? [];

        const initialCaixaById = new Map<string, any>(
          initialCaixas.map((c: any) => [String(c.id), c]),
        );

        const sortItems = (arr: Array<any>) =>
          [...arr].sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')));

        const getItemsByCaixaId = (arr: Array<any>, caixaId: string) =>
          sortItems(arr.filter((i: any) => String(i.caixaId) === caixaId));

        const changedCaixaIds = new Set<string>();
        for (const cur of currentCaixas) {
          const curId = String(cur.id);
          const init = initialCaixaById.get(curId);

          if (!init) {
            changedCaixaIds.add(curId);
            continue;
          }

          const caixaDiff =
            cur.type !== init.type || cur.value !== init.value || cur.weight !== init.weight;
          if (caixaDiff) {
            changedCaixaIds.add(curId);
            continue;
          }

          const initItems = getItemsByCaixaId(initialItens, curId);
          const curItems = getItemsByCaixaId(currentItens, curId);
          if (JSON.stringify(curItems) !== JSON.stringify(initItems)) {
            changedCaixaIds.add(curId);
          }
        }

        const currentCaixaIdSet = new Set(currentCaixas.map((c: any) => String(c.id)));
        const removedBackendProductIds = initialCaixas
          .map((c: any) => String(c.id))
          .filter(
            (bid) => existingProductIdsRef.current.has(bid) && !currentCaixaIdSet.has(bid),
          );
        if (removedBackendProductIds.length) {
          patch.deletedDriverServiceOrderProductIds = removedBackendProductIds;
        }

        if (changedCaixaIds.size) {
          patch.driverServiceOrderProducts = caixas
            .filter((c) => changedCaixaIds.has(String(c.id)))
            .map((c) => ({
              // Quando o produto existe no backend, enviamos `id` para update.
              // Quando for criado durante a edição, omitimos `id` para o backend criar.
              ...(existingProductIdsRef.current.has(c.id) ? { id: c.id } : {}),
              type: `${c.type} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[obterTipoProdutoDaCaixa(c) as keyof typeof PRODUCT_TYPE_TO_ITEM_KEY]]}`,
              value: c.value,
              weight: c.weight,
              driverServiceOrderProductsItems: itens
                .filter((i) => i.caixaId === c.id)
                .map((i) => ({
                  id: i.id,
                  name: i.name,
                  quantity: Number(i.quantity) || 0,
                  weight: Number(i.weight) || 0,
                  observations: i.observations ?? '',
                })),
            }));
        }
      }

      // Sempre envia motorista atual no PATCH (backend mapeia `userId` → `driver`; evita `user` inválido no Prisma).
      if (Object.keys(patch).length > 0) {
        patch.userId = payload.userId;
        patch.driverName = payload.driverName;
      }

      // Remove campos undefined para não enviar “chaves vazias” no PATCH.
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) delete (patch as any)[k];
      }

      if (Object.keys(patch).length === 0) {
        toast.info('Nenhum campo alterado.');
        return;
      }

      const result = await serviceOrderFormService.update(existingOrdem.id, patch);
      if (result.success && result.data) {
        if (onSave) onSave(result.data);
        void Promise.resolve(onAgendamentosAtualizados?.()).catch(() => { });
        toast.success('Ordem de serviço atualizada com sucesso!');
        onClose();
        return;
      }

      toast.error(result.error || 'Erro ao atualizar ordem de serviço');
      return;
    }

    const result = await serviceOrderFormService.create(payload);
    if (result.success && result.data) {
      onClose();
      void Promise.resolve(onAgendamentosAtualizados?.()).catch(() => { });
      if (onSave) onSave(result.data);
      toast.success('Ordem de serviço salva com sucesso!');
    }
  };

  const FormContent = (
    <motion.div
      initial={embedded ? { opacity: 0 } : { scale: 0.95, y: 20 }}
      animate={embedded ? { opacity: 1 } : { scale: 1, y: 0 }}
      exit={embedded ? { opacity: 0 } : { scale: 0.95, y: 20 }}
      className={embedded ? "bg-white rounded-lg shadow-sm w-full min-w-0" : "bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8 min-w-0"}
    >
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] text-white p-4 sm:p-6 rounded-t-lg flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          {embedded ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 mr-2 -ml-2"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          ) : (
            <div className="p-3 bg-[#F5A623] rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">ITAMOVING</h2>
            <p className="text-xs sm:text-sm text-white/80">
              {isEditMode
                ? `Editar ordem #${existingOrdem?.id} — Back-office`
                : 'Ordem de Serviço - Motorista'}
            </p>
          </div>
        </div>
        {!embedded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Conteúdo */}
      <div className={`p-4 sm:p-6 space-y-6 min-w-0 ${!embedded ? "max-h-[calc(100vh-200px)] overflow-y-auto" : ""}`}>
        {/* Informações da Empresa */}
        <Card className="border-[#F5A623] border-2">
          <CardContent className="pt-4">
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-[#1E3A5F]">
                ☎ {agendamento.company.contactPhone} 📱 @itamoving
              </p>
              <ul className="text-xs space-y-0.5 text-muted-foreground">
                <li>• 11 ANOS TRANSPORTANDO HISTÓRIAS DOS ESTADOS UNIDOS AO BRASIL</li>
                <li>• LEVAMOS SUA MUDANÇA COM TOTAL SEGURANÇA</li>
                <li>• TEMOS PASSAGENS AÉREAS</li>
                <li>• TRAZEMOS SUA ENCOMENDA DO BRASIL AOS ESTADOS UNIDOS</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {isEditMode || user?.role !== 'motorista' ? (
          <Card className="border-[#1E3A5F] border-2">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/40 border-[#1E3A5F] border-0 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                <ClipboardList className="w-5 h-5" />
                Gestão da ordem (back-office)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div
                className={`grid grid-cols-1 gap-4 ${isEditMode ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
              >
                {isEditMode ? (
                  <div className="space-y-2">
                    <Label htmlFor="osIdInterno">Nº da ordem</Label>
                    <Input
                      id="osIdInterno"
                      value={existingOrdem?.id ?? ''}
                      readOnly
                      className="bg-muted font-mono"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    required
                    value={ordemStatus}
                    onValueChange={(v: OrdemServicoMotorista['status']) => setOrdemStatus(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                      <SelectItem value="COMPLETED">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <ResponsavelSelect
                    items={motoristas}
                    label="Motorista responsável *"
                    value={motoristaResponsavel}
                    onValueChange={(v: string) => setMotoristaResponsavel(v)}
                    placeholder="Selecione o motorista responsável..."
                    searchPlaceholder="Buscar motorista responsável..."
                    emptyMessage="Nenhum motorista responsável encontrado."
                    disabled={user?.role === 'motorista'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obsInternas">Observações internas</Label>
                <Textarea
                  id="obsInternas"
                  rows={3}
                  value={isEditMode ? ordemObservacoes : observations}
                  onChange={(e) =>
                    isEditMode
                      ? setOrdemObservacoes(e.target.value)
                      : setObservations(e.target.value)
                  }
                  placeholder="Notas visíveis apenas na gestão da ordem..."
                  className="resize-y min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Seção Remetente (USA) */}
        <Card>
          <CardHeader className="bg-blue-50 rounded-t-lg border-0">
            <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
              <User className="w-5 h-5" />
              Remetente (USA)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="remetenteNome">Nome *</Label>
                <Input
                  id="remetenteNome"
                  value={remetenteNome}
                  onChange={(e) => setRemetenteNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remetenteCpfRg">CPF/RG</Label>
                <Input
                  id="remetenteCpfRg"
                  value={remetenteCpfRg}
                  onChange={(e) => setRemetenteCpfRg(e.target.value)}
                  placeholder="123.456.789-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remetenteTel">Telefone *</Label>
                <Input
                  id="remetenteTel"
                  value={remetenteTel}
                  onChange={(e) => setRemetenteTel(e.target.value)}
                  placeholder="+1 (305) 555-0000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="remetenteEndereco">Endereço *</Label>
                <Input
                  id="remetenteEndereco"
                  value={remetenteEndereco}
                  onChange={(e) => setRemetenteEndereco(e.target.value)}
                  placeholder="Rua, número"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remetenteNumero">Número *</Label>
                <Input
                  id="remetenteNumero"
                  value={remetenteNumero}
                  onChange={(e) => setRemetenteNumero(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remetenteComplemento">Complemento</Label>
                <Input
                  id="remetenteComplemento"
                  value={remetenteComplemento}
                  onChange={(e) => setRemetenteComplemento(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              <div className="space-y-2">
                <Label htmlFor="remetenteCidade">Cidade *</Label>
                <Input
                  id="remetenteCidade"
                  value={remetenteCidade}
                  onChange={(e) => setRemetenteCidade(e.target.value)}
                  placeholder="Miami"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remetenteEstado">Estado *</Label>
                <Input
                  id="remetenteEstado"
                  value={remetenteEstado}
                  onChange={(e) => setRemetenteEstado(e.target.value)}
                  placeholder="FL"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remetenteZipCode">ZIP Code *</Label>
                <Input
                  id="remetenteZipCode"
                  value={remetenteZipCode}
                  onChange={(e) => setRemetenteZipCode(e.target.value)}
                  placeholder="33101"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção Destinatário (Brasil) */}
        <Card>
          <CardHeader className="bg-green-50 rounded-t-lg border-0">
            <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
              <MapPin className="w-5 h-5" />
              Destinatário (Brasil)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destinatarioNome">Nome *</Label>
                <Input
                  id="destinatarioNome"
                  value={destinatarioNome}
                  onChange={(e) => setDestinatarioNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioCpfRg">CPF/RG</Label>
                <Input
                  id="destinatarioCpfRg"
                  value={destinatarioCpfRg}
                  onChange={(e) => setDestinatarioCpfRg(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioTelefone">Telefone *</Label>
                <Input
                  id="destinatarioTelefone"
                  value={destinatarioTelefone}
                  onChange={(e) => setDestinatarioTelefone(e.target.value)}
                  placeholder="+55 11 00000-0000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destinatarioEndereco">Endereço *</Label>
                <Input
                  id="destinatarioEndereco"
                  value={destinatarioEndereco}
                  onChange={(e) => setDestinatarioEndereco(e.target.value)}
                  placeholder="Rua, número"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioBairro">Bairro *</Label>
                <Input
                  id="destinatarioBairro"
                  value={destinatarioBairro}
                  onChange={(e) => setDestinatarioBairro(e.target.value)}
                  placeholder="Bairro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioNumero">Número *</Label>
                <Input
                  id="destinatarioNumero"
                  value={destinatarioNumero}
                  onChange={(e) => setDestinatarioNumero(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioComplemento">Complemento</Label>
                <Input
                  id="destinatarioComplemento"
                  value={destinatarioComplemento}
                  onChange={(e) => setDestinatarioComplemento(e.target.value)}
                  placeholder="Apto 101"
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destinatarioCidade">Cidade *</Label>
                <Input
                  id="destinatarioCidade"
                  value={destinatarioCidade}
                  onChange={(e) => setDestinatarioCidade(e.target.value)}
                  placeholder="São Paulo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioEstado">Estado *</Label>
                <Input
                  id="destinatarioEstado"
                  value={destinatarioEstado}
                  onChange={(e) => setDestinatarioEstado(e.target.value)}
                  placeholder="SP"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatarioCep">CEP *</Label>
                <Input
                  id="destinatarioCep"
                  value={destinatarioCep}
                  onChange={(e) => setDestinatarioCep(e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção Produtos e Valores */}
        <Card>
          <CardHeader className="bg-orange-50 rounded-t-lg border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                <Package className="w-5 h-5" />
                Produtos e Valores
              </CardTitle>
              <Button
                onClick={adicionarCaixa}
                size="sm"
                className="bg-[#F5A623] hover:bg-[#E59400] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Caixa ou Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {caixas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma caixa ou produto adicionado</p>
                <p className="text-sm">Clique em "Adicionar Caixa ou Produto" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Cabeçalho da tabela */}
                <div className="hidden md:grid md:grid-cols-11 gap-3 text-sm font-semibold text-muted-foreground border-b pb-2">
                  <div className="col-span-5 text-center">Tipo da Caixa ou Produto</div>
                  <div className="col-span-2 text-center">Peso (kg)</div>
                  <div className="col-span-3 text-center">Valor ($)</div>
                  <div className="col-span-1 text-center"></div>
                </div>

                {/* Linhas de caixas */}
                {caixas.map((caixa) => {
                  const itensDaCaixa = itens.filter((i) => i.caixaId === caixa.id);
                  const pesoItensDaCaixa = itensDaCaixa.reduce((acc, item) => acc + item.weight, 0).toFixed(2);
                  const pesoTotalCaixa = caixa.weight ? parseFloat(caixa.weight.toFixed(2)) : 0;
                  const isGreaterThanPesoTotalCaixa = (Number(pesoItensDaCaixa) > Number(pesoTotalCaixa)) ? "text-red-500" : "";
                  const podeAdicionarItens = caixaTemTodosCamposPreenchidos(caixa);
                  const fitaAdesiva = isFitaAdesiva(caixa);
                  return (
                    <motion.div
                      key={caixa.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border bg-gray-50/90 p-3 shadow-sm space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
                        <div className="md:col-span-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2 min-w-0">
                          <div className="flex-1 min-w-0 space-y-1">
                            <Label className="md:hidden">Tipo da Caixa ou Produto</Label>
                            <Select
                              value={caixa.type}
                              onValueChange={(valor) => atualizarCaixa(caixa.id, 'type', valor)}
                            >
                              <SelectTrigger className="bg-white w-full">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {opcoesCaixa.map((opcao) => (
                                  <SelectItem key={opcao.id} value={opcao.size || opcao.name}>
                                    {`${opcao.name} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[opcao.type]]}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {!fitaAdesiva && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={!podeAdicionarItens}
                              className="shrink-0 rounded-sm bg-[#F5A623] hover:bg-[#E59400] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                              title={
                                podeAdicionarItens
                                  ? 'Adicionar itens nesta caixa'
                                  : 'Preencha tipo, peso e valor da caixa antes de adicionar itens'
                              }
                              onClick={() => adicionarItens(caixa.id)}
                            >
                              <Plus className="w-5 h-5" />
                              Itens
                            </Button>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label className="md:hidden mb-2">Peso (kg)</Label>
                          <Input
                            type="number"
                            value={caixa.weight}
                            onChange={(e) =>
                              atualizarCaixa(caixa.id, 'weight', parseFloat(e.target.value) || 0)
                            }
                            placeholder="0.0"
                            step="0.1"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="md:hidden mb-2">Valor</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              value={caixa.value}
                              onChange={(e) =>
                                atualizarCaixa(caixa.id, 'value', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                              step="0.01"
                              className="pl-8"
                              disabled={
                                !opcoesCaixa.find(
                                  (p) => p.type === caixa.type || p.name === caixa.type,
                                )?.variablePrice
                              }
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end md:justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerCaixa(caixa.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {itensDaCaixa.length > 0 && (
                        <div className="rounded-lg border border-dashed border-border bg-white p-3 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Itens da caixa
                          </p>
                          <div className="hidden sm:grid sm:grid-cols-11 gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-1">
                            <span className="col-span-1 text-center">Item #</span>
                            <span className="col-span-3 text-center">Nome</span>
                            <span className="col-span-2 text-center">Quantidade</span>
                            <span className="col-span-2 text-center">Peso (kg)</span>
                            <span className="col-span-2 text-center">Observação</span>
                            <span className="col-span-1 text-center" />
                          </div>
                          <div className="space-y-2">
                            {itensDaCaixa.map((item, idx) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-end rounded-md border bg-muted/30 p-2"
                              >
                                <div className="flex h-9 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground sm:col-span-1">
                                  {idx + 1}
                                </div>
                                <div className="sm:col-span-3">
                                  <Label className="sm:hidden text-xs text-muted-foreground">Nome</Label>
                                  <Input
                                    value={item.name}
                                    type="text"
                                    required
                                    onChange={(e) => atualizarItem(item.id, 'name', e.target.value)}
                                    placeholder="Nome do item"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <Label className="sm:hidden text-xs text-muted-foreground">Quantidade</Label>
                                  <Input
                                    value={item.quantity}
                                    type="number"
                                    min={0}
                                    required
                                    onChange={(e) =>
                                      atualizarItem(
                                        item.id,
                                        'quantity',
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <Label className="sm:hidden text-xs text-muted-foreground">Peso</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    value={item.weight}
                                    required
                                    onChange={(e) =>
                                      atualizarItem(
                                        item.id,
                                        'weight',
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    placeholder="kg"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <Label className="sm:hidden text-xs text-muted-foreground">Obs.</Label>
                                  <Input
                                    type="text"
                                    value={item.observations ?? ''}
                                    onChange={(e) =>
                                      atualizarItem(item.id, 'observations', e.target.value)
                                    }
                                    placeholder="Observação"
                                  />
                                </div>
                                <div className="sm:col-span-1 flex justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removerItens(item.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col justify-end gap-2 items-start sm:items-end">
                            <div className="flex gap-2">
                              <p className="text-sm text-muted-foreground font-semibold">Total de Itens da Caixa:</p>
                              <p className="text-sm text-muted-foreground">{itensDaCaixa.length}</p>
                            </div>
                            <div className="flex gap-2">
                              <p className={`text-sm text-muted-foreground font-semibold ${isGreaterThanPesoTotalCaixa}`}>Peso Total dos Itens:</p>
                              <p className={`text-sm text-muted-foreground ${isGreaterThanPesoTotalCaixa}`}>{pesoItensDaCaixa} kg</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Total */}
                <div className="flex justify-end pt-3 border-t">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total de Caixas:</p>
                    <p className="text-2xl font-bold text-[#1E3A5F]">{caixas.length}</p>
                    <p className="text-sm text-muted-foreground mt-2">Valor Total:</p>
                    <p className="text-2xl font-bold text-green-600">
                      $ {valorTotalCaixas.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção Assinaturas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assinatura Cliente */}
          <Card>
            <CardHeader className="bg-purple-50 rounded-t-lg border-0">
              <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                <Signature className="w-5 h-5" />
                Assinatura Cliente *
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasClienteRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawingCliente}
                  onMouseMove={drawCliente}
                  onMouseUp={stopDrawingCliente}
                  onMouseLeave={stopDrawingCliente}
                  onTouchStart={startDrawingCliente}
                  onTouchMove={drawCliente}
                  onTouchEnd={stopDrawingCliente}
                  className="w-full border border-border rounded cursor-crosshair"
                />
              </div>
              <Button
                variant="outline"
                onClick={limparAssinaturaCliente}
                className="w-full"
                size="sm"
              >
                Limpar Assinatura
              </Button>
            </CardContent>
          </Card>

          {/* Assinatura Agente */}
          <Card>
            <CardHeader className="bg-blue-50 rounded-t-lg border-0">
              <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                <Signature className="w-5 h-5" />
                Assinatura Agente *
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasAgenteRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawingAgente}
                  onMouseMove={drawAgente}
                  onMouseUp={stopDrawingAgente}
                  onMouseLeave={stopDrawingAgente}
                  onTouchStart={startDrawingAgente}
                  onTouchMove={drawAgente}
                  onTouchEnd={stopDrawingAgente}
                  className="w-full border border-border rounded cursor-crosshair"
                />
              </div>
              <Button
                variant="outline"
                onClick={limparAssinaturaAgente}
                className="w-full"
                size="sm"
              >
                Limpar Assinatura
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Seção Pagamento em Espécie */}
        <Card className="border-2 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg border-0">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Pagamento em Espécie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <span className="text-sm text-muted-foreground">Valor Total das Caixas:</span>
                  <span className="text-2xl font-bold text-green-700">
                    $ {valorTotalCaixas.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-4">
                  <Label htmlFor="valorPago" className="text-base font-semibold mb-2 block">
                    Valor Recebido em Espécie ou Zelle
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="valorPago"
                      type="number"
                      placeholder="0.00"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                      className="pl-10 text-lg font-semibold h-12 border-green-300 focus:border-green-500"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Este valor será registrado como pagamento recebido em espécie
                  </p>
                </div>
              </div>

              {valorPago && parseFloat(valorPago) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">
                      Pagamento Registrado
                    </p>
                    <p className="text-xs text-blue-700">
                      $ {parseFloat(valorPago).toFixed(2)} em espécie
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Observações (somente criação pelo próprio motorista; admin usa o card de gestão) */}
        {!isEditMode && user?.role === 'motorista' && (
          <>
            <Card>
              <CardHeader className="bg-gray-50 rounded-t-lg border-0">
                <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                  <FileText className="w-5 h-5" />
                  Observações da Ordem de Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Textarea
                  id="observations"
                  placeholder="Digite suas observações aqui"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="resize-none h-24 border-2 border-border rounded-lg p-2 bg-white"
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Nota Importante */}
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-semibold mb-1">Informação Importante:</p>
                <p>
                  TEMPO PARA ENTREGA: 3 A 4 MESES DEPOIS QUE O CONTAINER SAI DOS EUA E NÃO DA DATA QUE É RECOLHIDO NA CASA DO CLIENTE.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé com Botões */}
      <div className="p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground w-full sm:w-auto">
          <p>Data: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          <p>
            Agente:{' '}
            {isEditMode
              ? motoristaResponsavelNome || existingOrdem?.driverName || user?.nome || 'Motorista'
              : user?.role === 'motorista'
                ? user?.nome || 'Motorista'
                : motoristaResponsavelNome || '—'}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            onClick={salvarOrdemServico}
            disabled={isEditMode ? !canSave : false}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? 'Salvar alterações' : 'Salvar Ordem de Serviço'}
          </Button>
        </div>
      </div>
    </motion.div >
  );

  if (embedded) {
    return FormContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6"
    >
      {FormContent}
    </motion.div>
  );
}