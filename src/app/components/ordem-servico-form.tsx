import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useData } from '../context/DataContext';
import { OrdemServicoMotorista } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import {
  Truck,
  FileText,
  Plus,
  Trash2,
  Save,
  User,
  MapPin,
  Phone,
  Package,
  DollarSign,
  Signature,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { toast } from 'sonner';

interface OrdemServicoFormProps {
  agendamentoId: string;
  agendamento: any;
  onClose: () => void;
  onSave?: (ordem: OrdemServicoMotorista) => void;
}

interface Caixa {
  id: string;
  tipo: string;
  numero: string;
  valor: number;
}

export default function OrdemServicoForm({ agendamentoId, agendamento, onClose, onSave }: OrdemServicoFormProps) {
  const { clientes, addOrdemServicoMotorista } = useData();
  const { user } = useAuth();
  const canvasClienteRef = useRef<HTMLCanvasElement>(null);
  const canvasAgenteRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingCliente, setIsDrawingCliente] = useState(false);
  const [isDrawingAgente, setIsDrawingAgente] = useState(false);

  // Buscar cliente relacionado ao agendamento
  const cliente = clientes.find(c => c.id === agendamento.clienteId);

  // Estados do formulário - Remetente (USA)
  const [remetenteNome, setRemetenteNome] = useState(cliente?.nome || '');
  const [remetenteTel, setRemetenteTel] = useState(cliente?.telefoneUSA || '');
  const [remetenteEndereco, setRemetenteEndereco] = useState(
    cliente ? `${cliente.enderecoUSA.rua}, ${cliente.enderecoUSA.numero}` : ''
  );
  const [remetenteCidade, setRemetenteCidade] = useState(cliente?.enderecoUSA.cidade || '');
  const [remetenteEstado, setRemetenteEstado] = useState(cliente?.enderecoUSA.estado || '');
  const [remetenteZipCode, setRemetenteZipCode] = useState(cliente?.enderecoUSA.zipCode || '');
  const [remetenteCpfRg, setRemetenteCpfRg] = useState(cliente?.cpf || '');

  // Estados do formulário - Destinatário (Brasil)
  const [destinatarioNome, setDestinatarioNome] = useState(cliente?.destinoBrasil.nomeRecebedor || '');
  const [destinatarioCpfRg, setDestinatarioCpfRg] = useState(cliente?.destinoBrasil.cpfRecebedor || '');
  const [destinatarioEndereco, setDestinatarioEndereco] = useState(cliente?.destinoBrasil.endereco || '');
  const [destinatarioBairro, setDestinatarioBairro] = useState('');
  const [destinatarioCidade, setDestinatarioCidade] = useState(cliente?.destinoBrasil.cidade || '');
  const [destinatarioEstado, setDestinatarioEstado] = useState(cliente?.destinoBrasil.estado || '');
  const [destinatarioCep, setDestinatarioCep] = useState(cliente?.destinoBrasil.cep || '');
  const [destinatarioTelefone, setDestinatarioTelefone] = useState(
    cliente?.destinoBrasil.telefones?.[0] || ''
  );

  // Estados para caixas
  const [caixas, setCaixas] = useState<Caixa[]>([]);

  // Estados para assinaturas
  const [assinaturaCliente, setAssinaturaCliente] = useState('');
  const [assinaturaAgente, setAssinaturaAgente] = useState('');

  // Estado para valor pago
  const [valorPago, setValorPago] = useState('0.00');

  // Calcular valor total das caixas
  const valorTotalCaixas = caixas.reduce((sum, c) => sum + c.valor, 0);

  // Adicionar caixa
  const adicionarCaixa = () => {
    setCaixas([
      ...caixas,
      {
        id: Date.now().toString(),
        tipo: '',
        numero: '',
        valor: 0,
      },
    ]);
  };

  // Remover caixa
  const removerCaixa = (id: string) => {
    setCaixas(caixas.filter(c => c.id !== id));
  };

  // Atualizar caixa
  const atualizarCaixa = (id: string, campo: keyof Caixa, valor: string | number) => {
    setCaixas(caixas.map(c => (c.id === id ? { ...c, [campo]: valor } : c)));
  };

  // Funções de desenho da assinatura - Cliente
  const startDrawingCliente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasClienteRef.current;
    if (!canvas) return;

    setIsDrawingCliente(true);
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
      setAssinaturaCliente(canvas.toDataURL());
    }
  };

  const limparAssinaturaCliente = () => {
    const canvas = canvasClienteRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaCliente('');
  };

  // Funções de desenho da assinatura - Agente
  const startDrawingAgente = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasAgenteRef.current;
    if (!canvas) return;

    setIsDrawingAgente(true);
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
      setAssinaturaAgente(canvas.toDataURL());
    }
  };

  const limparAssinaturaAgente = () => {
    const canvas = canvasAgenteRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaAgente('');
  };

  // Salvar ordem de serviço
  const salvarOrdemServico = () => {
    // Validações básicas
    if (!remetenteNome || !remetenteTel || !remetenteEndereco) {
      toast.error('Preencha todos os campos obrigatórios do remetente');
      return;
    }

    if (!destinatarioNome || !destinatarioCpfRg || !destinatarioEndereco) {
      toast.error('Preencha todos os campos obrigatórios do destinatário');
      return;
    }

    if (caixas.length === 0) {
      toast.error('Adicione pelo menos uma caixa');
      return;
    }

    if (!assinaturaCliente) {
      toast.error('É necessária a assinatura do cliente');
      return;
    }

    const novaOrdem: OrdemServicoMotorista = {
      id: Date.now().toString(),
      agendamentoId,
      remetente: {
        nome: remetenteNome,
        telefone: remetenteTel,
        endereco: remetenteEndereco,
        cidade: remetenteCidade,
        estado: remetenteEstado,
        zipCode: remetenteZipCode,
        cpfRg: remetenteCpfRg,
      },
      destinatario: {
        nome: destinatarioNome,
        cpfRg: destinatarioCpfRg,
        endereco: destinatarioEndereco,
        bairro: destinatarioBairro,
        cidade: destinatarioCidade,
        estado: destinatarioEstado,
        cep: destinatarioCep,
        telefone: destinatarioTelefone,
      },
      caixas: caixas.map(c => ({
        id: c.id,
        tipo: c.tipo,
        numero: c.numero,
        valor: c.valor,
      })),
      assinaturaCliente,
      assinaturaAgente,
      dataAssinatura: new Date().toISOString(),
      motoristaNome: user?.nome || 'Motorista',
      motoristaId: user?.id || '1',
      status: 'concluida',
    };

    addOrdemServicoMotorista(novaOrdem);
    
    if (onSave) {
      onSave(novaOrdem);
    }

    toast.success('Ordem de serviço salva com sucesso!');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8"
      >
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] text-white p-6 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F5A623] rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">ITAMOVING</h2>
              <p className="text-sm text-white/80">Ordem de Serviço - Motorista</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Informações da Empresa */}
          <Card className="border-[#F5A623] border-2">
            <CardContent className="pt-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-[#1E3A5F]">
                  ☎ 267-310-9702 📱 @itamoving
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remetenteNome">Remetente *</Label>
                  <Input
                    id="remetenteNome"
                    value={remetenteNome}
                    onChange={(e) => setRemetenteNome(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="remetenteTel">Telefone *</Label>
                  <Input
                    id="remetenteTel"
                    value={remetenteTel}
                    onChange={(e) => setRemetenteTel(e.target.value)}
                    placeholder="+1 (305) 555-0000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remetenteEndereco">Endereço *</Label>
                <Input
                  id="remetenteEndereco"
                  value={remetenteEndereco}
                  onChange={(e) => setRemetenteEndereco(e.target.value)}
                  placeholder="Rua, número"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="remetenteCidade">Cidade</Label>
                  <Input
                    id="remetenteCidade"
                    value={remetenteCidade}
                    onChange={(e) => setRemetenteCidade(e.target.value)}
                    placeholder="Miami"
                  />
                </div>
                <div>
                  <Label htmlFor="remetenteEstado">Estado</Label>
                  <Input
                    id="remetenteEstado"
                    value={remetenteEstado}
                    onChange={(e) => setRemetenteEstado(e.target.value)}
                    placeholder="FL"
                  />
                </div>
                <div>
                  <Label htmlFor="remetenteZipCode">ZIP Code</Label>
                  <Input
                    id="remetenteZipCode"
                    value={remetenteZipCode}
                    onChange={(e) => setRemetenteZipCode(e.target.value)}
                    placeholder="33101"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remetenteCpfRg">CPF/RG</Label>
                <Input
                  id="remetenteCpfRg"
                  value={remetenteCpfRg}
                  onChange={(e) => setRemetenteCpfRg(e.target.value)}
                  placeholder="123.456.789-00"
                />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinatarioNome">Nome *</Label>
                  <Input
                    id="destinatarioNome"
                    value={destinatarioNome}
                    onChange={(e) => setDestinatarioNome(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="destinatarioCpfRg">CPF/RG *</Label>
                  <Input
                    id="destinatarioCpfRg"
                    value={destinatarioCpfRg}
                    onChange={(e) => setDestinatarioCpfRg(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="destinatarioEndereco">Endereço *</Label>
                <Input
                  id="destinatarioEndereco"
                  value={destinatarioEndereco}
                  onChange={(e) => setDestinatarioEndereco(e.target.value)}
                  placeholder="Rua, número"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinatarioBairro">Bairro</Label>
                  <Input
                    id="destinatarioBairro"
                    value={destinatarioBairro}
                    onChange={(e) => setDestinatarioBairro(e.target.value)}
                    placeholder="Nome do bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="destinatarioCidade">Cidade</Label>
                  <Input
                    id="destinatarioCidade"
                    value={destinatarioCidade}
                    onChange={(e) => setDestinatarioCidade(e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="destinatarioEstado">Estado</Label>
                  <Input
                    id="destinatarioEstado"
                    value={destinatarioEstado}
                    onChange={(e) => setDestinatarioEstado(e.target.value)}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <Label htmlFor="destinatarioCep">CEP</Label>
                  <Input
                    id="destinatarioCep"
                    value={destinatarioCep}
                    onChange={(e) => setDestinatarioCep(e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="destinatarioTelefone">Telefone</Label>
                  <Input
                    id="destinatarioTelefone"
                    value={destinatarioTelefone}
                    onChange={(e) => setDestinatarioTelefone(e.target.value)}
                    placeholder="+55 11 00000-0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Caixas */}
          <Card>
            <CardHeader className="bg-orange-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                  <Package className="w-5 h-5" />
                  Caixas e Valores
                </CardTitle>
                <Button
                  onClick={adicionarCaixa}
                  size="sm"
                  className="bg-[#F5A623] hover:bg-[#E59400]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Caixa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {caixas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma caixa adicionada</p>
                  <p className="text-sm">Clique em "Adicionar Caixa" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Cabeçalho da tabela */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 text-sm font-semibold text-muted-foreground border-b pb-2">
                    <div className="col-span-4">Tipo da Caixa</div>
                    <div className="col-span-3">Nº</div>
                    <div className="col-span-4">Valor (R$)</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Linhas de caixas */}
                  {caixas.map((caixa) => (
                    <motion.div
                      key={caixa.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="md:col-span-4">
                        <Label className="md:hidden mb-2">Tipo da Caixa</Label>
                        <Input
                          value={caixa.tipo}
                          onChange={(e) => atualizarCaixa(caixa.id, 'tipo', e.target.value)}
                          placeholder="Ex: Pequena, Média, Grande"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="md:hidden mb-2">Número</Label>
                        <Input
                          value={caixa.numero}
                          onChange={(e) => atualizarCaixa(caixa.id, 'numero', e.target.value)}
                          placeholder="Ex: 001"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <Label className="md:hidden mb-2">Valor</Label>
                        <Input
                          type="number"
                          value={caixa.valor}
                          onChange={(e) =>
                            atualizarCaixa(caixa.id, 'valor', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerCaixa(caixa.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Total */}
                  <div className="flex justify-end pt-3 border-t">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total de Caixas:</p>
                      <p className="text-2xl font-bold text-[#1E3A5F]">{caixas.length}</p>
                      <p className="text-sm text-muted-foreground mt-2">Valor Total:</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {valorTotalCaixas.toFixed(2)}
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
                  Assinatura Agente
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
                      R$ {valorTotalCaixas.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-4">
                    <Label htmlFor="valorPago" className="text-base font-semibold mb-2 block">
                      Valor Recebido em Espécie
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
                        R$ {parseFloat(valorPago).toFixed(2)} em espécie
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
                    ENTREGAS DE 3 A 4 MESES DEPOIS QUE O CONTÊINER SAI DOS EUA, NÃO DÁ DATA QUE
                    RECOLHA NA SUA CASA.
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
    </motion.div>
  );
}