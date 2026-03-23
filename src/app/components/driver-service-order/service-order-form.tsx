import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useData } from '../../context/DataContext';
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
  ArrowLeft
} from 'lucide-react';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { toast } from 'sonner';

import { productsService } from '../../services';
import { Caixa, Item, OrdemServicoFormProps, serviceOrderFormService } from '../../services/driver-service-order/service-order-form.service';
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from '../stock';

export default function OrdemServicoForm({ appointmentId, agendamento, onClose, onSave, onAgendamentosAtualizados, embedded = false }: OrdemServicoFormProps) {
  const { user } = useAuth();
  const canvasClienteRef = useRef<HTMLCanvasElement>(null);
  const canvasAgenteRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingCliente, setIsDrawingCliente] = useState(false);
  const [isDrawingAgente, setIsDrawingAgente] = useState(false);
  const [precosProdutos, setPrecosProdutos] = useState<PrecoProduto[]>([]);

  const carregarProdutos = async () => {
    const result = await productsService.getAll();
    if (result.success && result.data) {
      setPrecosProdutos(result.data);
      return result.data;
    }
    return [] as PrecoProduto[];
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

  // Calcular valor total das caixas
  const valorTotalCaixas = caixas.reduce((sum, c) => sum + c.value, 0);

  const renumerarCaixas = (lista: Caixa[]) =>
    lista.map((caixa, index) => ({
      ...caixa,
      number: `A${index + 1}`,
    }));

  const novoIdItem = () =>
    `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  /** Mesma regra usada ao salvar a ordem: tipo, nº, valor e peso válidos. */
  const caixaTemTodosCamposPreenchidos = (c: Caixa) => {
    const tipoValido = Boolean(String(c.type ?? '').trim());
    const numeroValido = Boolean(String(c.number ?? '').trim());
    const valorValido = Number.isFinite(Number(c.value)) && Number(c.value) > 0;
    const pesoValido = Number.isFinite(Number(c.weight)) && Number(c.weight) > 0;
    return tipoValido && numeroValido && valorValido && pesoValido;
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
      toast.error('Preencha tipo, número, peso e valor da caixa antes de adicionar itens');
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
      if (clienteAssinaturaDirtyRef.current) {
        setAssinaturaCliente(canvas.toDataURL());
      } else {
        setAssinaturaCliente('');
      }
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
      if (agenteAssinaturaDirtyRef.current) {
        setAssinaturaAgente(canvas.toDataURL());
      } else {
        setAssinaturaAgente('');
      }
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

  // Importante: se o modal/form reaproveitar o componente (sem desmontar), o canvas e o state
  // podem ficar com assinatura anterior. Ao trocar o agendamento, zeramos tudo.
  useEffect(() => {
    const clienteCanvas = canvasClienteRef.current;
    if (clienteCanvas) {
      const ctx = clienteCanvas.getContext('2d');
      ctx?.clearRect(0, 0, clienteCanvas.width, clienteCanvas.height);
    }
    setAssinaturaCliente('');
    clienteAssinaturaDirtyRef.current = false;

    const agenteCanvas = canvasAgenteRef.current;
    if (agenteCanvas) {
      const ctx = agenteCanvas.getContext('2d');
      ctx?.clearRect(0, 0, agenteCanvas.width, agenteCanvas.height);
    }
    setAssinaturaAgente('');
    agenteAssinaturaDirtyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  // Salvar ordem de serviço
  const salvarOrdemServico = async () => {
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

    if (!assinaturaCliente) {
      toast.error('É necessária a assinatura do cliente');
      return;
    }

    if (!assinaturaAgente) {
      toast.error('É necessária a assinatura do agente');
      return;
    }

    if (Number(valorPago) <= 0) {
      toast.error('O valor pago deve ser maior que 0');
      return;
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
        id: c.id,
        type: c.type,
        number: c.number,
        value: c.value,
        weight: c.weight,
        driverServiceOrderProductsItems: itens
          .filter((i) => i.caixaId === c.id)
          .map((i) => ({
            name: i.name,
            quantity: Number(i.quantity) || 0,
            weight: Number(i.weight) || 0,
            observations: i.observations ?? '',
          })),
      })),
      clientSignature: assinaturaCliente,
      agentSignature: assinaturaAgente,
      signatureDate: new Date().toISOString(),
      driverName: user?.nome || 'Motorista',
      userId: user?.id || '1',
      status: 'COMPLETED',
      chargedValue: parseFloat(valorPago),
    };

    const result = await serviceOrderFormService.create(payload);
    if (result.success && result.data) {
      onClose();
      void Promise.resolve(onAgendamentosAtualizados?.()).catch(() => {});
      if (onSave) onSave(result.data);
      toast.success('Ordem de serviço salva com sucesso!');
    }
  };

  const FormContent = (
    <motion.div
      initial={embedded ? { opacity: 0 } : { scale: 0.95, y: 20 }}
      animate={embedded ? { opacity: 1 } : { scale: 1, y: 0 }}
      exit={embedded ? { opacity: 0 } : { scale: 0.95, y: 20 }}
      className={embedded ? "bg-white rounded-lg shadow-sm w-full" : "bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8"}
    >
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] text-white p-6 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
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

          <div>
            <h2 className="text-2xl font-bold">ITAMOVING</h2>
            <p className="text-sm text-white/80">Ordem de Serviço - Motorista</p>
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
      <div className={`p-6 space-y-6 ${!embedded ? "max-h-[calc(100vh-200px)] overflow-y-auto" : ""}`}>
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

        {/* Seção Remetente (USA) */}
        <Card>
          <CardHeader className="bg-blue-50">
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
          <CardHeader className="bg-green-50">
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
          <CardHeader className="bg-orange-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                <Package className="w-5 h-5" />
                Produtos e Valores
              </CardTitle>
              <Button
                onClick={adicionarCaixa}
                size="sm"
                className="bg-[#F5A623] hover:bg-[#E59400]"
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
                <div className="hidden md:grid md:grid-cols-13 gap-3 text-sm font-semibold text-muted-foreground border-b pb-2">
                  <div className="col-span-5 text-center">Tipo da Caixa ou Produto</div>
                  <div className="col-span-2 text-center">Nº</div>
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
                      <div className="grid grid-cols-1 md:grid-cols-13 gap-3 items-end">
                        <div className="md:col-span-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
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
                              className="shrink-0 rounded-sm bg-[#F5A623] hover:bg-[#E59400] whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
                              title={
                                podeAdicionarItens
                                  ? 'Adicionar itens nesta caixa'
                                  : 'Preencha tipo, número, peso e valor da caixa antes de adicionar itens'
                              }
                              onClick={() => adicionarItens(caixa.id)}
                            >
                              <Plus className="w-5 h-5" />
                              Itens
                            </Button>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label className="md:hidden mb-2">Número</Label>
                          <Input
                            value={caixa.number}
                            onChange={(e) => atualizarCaixa(caixa.id, 'number', e.target.value)}
                            placeholder="A1, A2, A3, etc."
                            readOnly
                          />
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
                            Itens da caixa: <span className="text-foreground">{caixa.number}</span>
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

                          <div className="flex flex-col justify-end gap-2 items-end">
                            <div className="flex flex-inline gap-2">
                              <p className="text-sm text-muted-foreground font-semibold">Total de Itens da Caixa:</p>
                              <p className="text-sm text-muted-foreground">{itensDaCaixa.length}</p>
                            </div>
                            <div className="flex flex-inline gap-2">
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
            <CardHeader className="bg-purple-50">
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
            <CardHeader className="bg-blue-50">
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
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Pagamento em Espécie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
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
      <div className="p-6 border-t bg-gray-50 rounded-b-lg flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <p>Data: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          <p>Agente: {user?.nome || 'Motorista'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={salvarOrdemServico}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Ordem de Serviço
          </Button>
        </div>
      </div>
    </motion.div>
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