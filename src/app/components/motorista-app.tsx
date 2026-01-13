import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import OrdemServicoForm from './ordem-servico-form';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  Camera,
  Signature,
  User,
  Calendar,
  Phone,
  Receipt,
  Download,
  AlertCircle,
  Navigation,
  Box,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface OrdemServico {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  dataColeta: string;
  horaColeta: string;
  enderecoColeta: string;
  enderecoEntrega: string;
  caixasPequenas: number;
  caixasMedias: number;
  caixasGrandes: number;
  observacoes: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  valorCobrado?: number;
  assinatura?: string;
  fotosEntrega?: string[];
}

export default function MotoristaApp() {
  const { agendamentos, estoque } = useData();
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemServico | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'ordem' | 'recibo'>('lista');
  const [valorPago, setValorPago] = useState('');
  const [assinando, setAssinando] = useState(false);
  const [assinatura, setAssinatura] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);

  // Converter agendamentos em ordens de serviço
  const ordensServico: OrdemServico[] = agendamentos
    .filter(a => a.status === 'confirmado')
    .map(a => ({
      id: a.id,
      clienteNome: a.clienteNome,
      clienteTelefone: a.telefone || '(305) 555-0100',
      dataColeta: a.dataColeta,
      horaColeta: a.horaColeta,
      enderecoColeta: a.endereco,
      enderecoEntrega: a.destino || 'São Paulo - SP, Brasil',
      caixasPequenas: Math.floor(Math.random() * 5) + 1,
      caixasMedias: Math.floor(Math.random() * 5) + 1,
      caixasGrandes: Math.floor(Math.random() * 3) + 1,
      observacoes: a.observacoes || 'Sem observações',
      status: 'pendente',
    }));

  const totalCaixas = (ordem: OrdemServico) =>
    ordem.caixasPequenas + ordem.caixasMedias + ordem.caixasGrandes;

  // Funções de desenho da assinatura
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
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

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setAssinatura(canvas.toDataURL());
    }
  };

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinatura('');
  };

  const finalizarEntrega = () => {
    if (!ordemSelecionada || !assinatura || !valorPago) {
      alert('Por favor, preencha todos os campos e obtenha a assinatura do cliente.');
      return;
    }

    // Salvar dados da entrega
    const ordemAtualizada = {
      ...ordemSelecionada,
      status: 'concluida' as const,
      valorCobrado: parseFloat(valorPago.replace(/[^\d,]/g, '').replace(',', '.')),
      assinatura: assinatura,
    };

    setOrdemSelecionada(ordemAtualizada);
    setViewMode('recibo');
  };

  const formatarMoeda = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    const valorNumerico = parseFloat(numero) / 100;
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setValorPago(formatarMoeda(valor));
  };

  const imprimirRecibo = () => {
    window.print();
  };

  if (viewMode === 'recibo' && ordemSelecionada) {
    return (
      <div className="space-y-6 print:bg-white">
        <div className="flex items-center justify-between print:hidden">
          <Button
            variant="outline"
            onClick={() => {
              setViewMode('lista');
              setOrdemSelecionada(null);
              setValorPago('');
              limparAssinatura();
            }}
          >
            ← Voltar
          </Button>
          <Button onClick={imprimirRecibo} className="bg-[#1E3A5F]">
            <Download className="w-4 h-4 mr-2" />
            Imprimir Recibo
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-[#1E3A5F] rounded-lg p-8 max-w-3xl mx-auto"
        >
          {/* Cabeçalho */}
          <div className="text-center border-b-2 border-[#1E3A5F] pb-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-[#F5A623] to-[#E59400] rounded-xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#1E3A5F]">ITAMOVING</h1>
            </div>
            <p className="text-sm text-muted-foreground">Mudanças Internacionais EUA-Brasil</p>
            <p className="text-xs text-muted-foreground mt-1">
              Miami, FL - São Paulo, SP | Tel: (305) 555-0199
            </p>
          </div>

          {/* Informações do Recibo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1E3A5F]">RECIBO DE ENTREGA</h2>
              <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                CONCLUÍDO
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nº Ordem:</span>
                <span className="font-semibold ml-2">#{ordemSelecionada.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Data:</span>
                <span className="font-semibold ml-2">
                  {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Cliente
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-semibold">{ordemSelecionada.clienteNome}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Telefone:</span>
                <span className="font-semibold">{ordemSelecionada.clienteTelefone}</span>
              </div>
            </div>
          </div>

          {/* Itens da Entrega */}
          <div className="border border-border rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
              <Box className="w-5 h-5" />
              Itens Entregues
            </h3>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordemSelecionada.caixasPequenas > 0 && (
                  <tr>
                    <td className="py-2">Caixas Pequenas</td>
                    <td className="py-2 text-center font-semibold">
                      {ordemSelecionada.caixasPequenas}
                    </td>
                  </tr>
                )}
                {ordemSelecionada.caixasMedias > 0 && (
                  <tr>
                    <td className="py-2">Caixas Médias</td>
                    <td className="py-2 text-center font-semibold">
                      {ordemSelecionada.caixasMedias}
                    </td>
                  </tr>
                )}
                {ordemSelecionada.caixasGrandes > 0 && (
                  <tr>
                    <td className="py-2">Caixas Grandes</td>
                    <td className="py-2 text-center font-semibold">
                      {ordemSelecionada.caixasGrandes}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 font-bold">
                  <td className="py-2">TOTAL DE CAIXAS</td>
                  <td className="py-2 text-center">{totalCaixas(ordemSelecionada)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Valor Pago */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-900">Valor Pago em Espécie:</span>
              <span className="text-2xl font-bold text-green-700">
                {valorPago}
              </span>
            </div>
          </div>

          {/* Assinatura */}
          <div className="border-t-2 border-dashed border-border pt-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-3">Assinatura do Cliente:</h3>
            {assinatura && (
              <div className="border border-border rounded-lg p-4 bg-gray-50">
                <img src={assinatura} alt="Assinatura" className="h-24 mx-auto" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Declaro que recebi os itens acima relacionados em perfeito estado.
            </p>
          </div>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>ITAMOVING - Mudanças Internacionais</p>
            <p>www.itamoving.com | contato@itamoving.com</p>
            <p className="mt-2">Este documento comprova a entrega e pagamento dos serviços prestados.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (viewMode === 'ordem' && ordemSelecionada) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setViewMode('lista')}>
            ← Voltar para Ordens
          </Button>
          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
            Ordem #{ordemSelecionada.id}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Detalhes da Ordem */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Detalhes da Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-[#1E3A5F] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{ordemSelecionada.clienteNome}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {ordemSelecionada.clienteTelefone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Data e Hora</p>
                    <p className="font-semibold">
                      {format(new Date(ordemSelecionada.dataColeta), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">{ordemSelecionada.horaColeta}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Home className="w-5 h-5 text-[#F5A623] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Endereço de Coleta</p>
                    <p className="font-semibold text-sm">{ordemSelecionada.enderecoColeta}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Endereço de Entrega</p>
                    <p className="font-semibold text-sm">{ordemSelecionada.enderecoEntrega}</p>
                  </div>
                </div>
              </div>

              {/* Quantidade de Caixas */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Quantidade de Caixas
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <Box className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                    <p className="text-2xl font-bold text-blue-900">
                      {ordemSelecionada.caixasPequenas}
                    </p>
                    <p className="text-xs text-blue-700">Pequenas</p>
                  </div>
                  <div className="text-center p-3 bg-orange-100 rounded-lg">
                    <Package className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                    <p className="text-2xl font-bold text-orange-900">
                      {ordemSelecionada.caixasMedias}
                    </p>
                    <p className="text-xs text-orange-700">Médias</p>
                  </div>
                  <div className="text-center p-3 bg-purple-100 rounded-lg">
                    <Box className="w-7 h-7 mx-auto text-purple-600 mb-1" />
                    <p className="text-2xl font-bold text-purple-900">
                      {ordemSelecionada.caixasGrandes}
                    </p>
                    <p className="text-xs text-purple-700">Grandes</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] rounded-lg text-center">
                  <p className="text-white text-lg font-bold">
                    Total: {totalCaixas(ordemSelecionada)} caixas
                  </p>
                </div>
              </div>

              {ordemSelecionada.observacoes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-[#1E3A5F] mb-2">Observações:</h4>
                  <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
                    {ordemSelecionada.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de Pagamento e Assinatura */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Pagamento em Espécie
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="valor" className="text-base">
                      Valor Recebido
                    </Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="valor"
                        type="text"
                        placeholder="R$ 0,00"
                        value={valorPago}
                        onChange={handleValorChange}
                        className="pl-10 text-lg font-semibold h-12"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-[#F5A623] to-[#E59400] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Signature className="w-6 h-6" />
                  Assinatura do Cliente
                </CardTitle>
                <CardDescription className="text-white/80">
                  Solicite que o cliente assine no espaço abaixo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full border border-border rounded cursor-crosshair bg-white"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={limparAssinatura}
                    className="w-full"
                  >
                    Limpar Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={finalizarEntrega}
              disabled={!assinatura || !valorPago}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Finalizar Entrega e Gerar Recibo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Minhas Entregas</h2>
          <p className="text-muted-foreground mt-1">
            Ordens de serviço confirmadas para hoje
          </p>
        </div>
        <Badge className="text-lg px-4 py-2 bg-[#F5A623]">
          {ordensServico.length} ordens
        </Badge>
      </div>

      {/* Estoque Disponível */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
            <Package className="w-6 h-6" />
            Estoque Disponível no Caminhão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Box className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-3xl font-bold text-blue-900">{estoque.caixasPequenas}</p>
              <p className="text-sm text-muted-foreground">Pequenas</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Package className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-3xl font-bold text-orange-900">{estoque.caixasMedias}</p>
              <p className="text-sm text-muted-foreground">Médias</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Box className="w-10 h-10 mx-auto text-purple-600 mb-2" />
              <p className="text-3xl font-bold text-purple-900">{estoque.caixasGrandes}</p>
              <p className="text-sm text-muted-foreground">Grandes</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Package className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-3xl font-bold text-green-900">{estoque.fitas}</p>
              <p className="text-sm text-muted-foreground">Fitas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ordens */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {ordensServico.map((ordem, index) => (
            <motion.div
              key={ordem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all border-l-4 border-l-[#F5A623]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{ordem.clienteNome}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {ordem.clienteTelefone}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {totalCaixas(ordem)} caixas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(ordem.dataColeta), 'dd/MM/yyyy', { locale: ptBR })} às{' '}
                      {ordem.horaColeta}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Home className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{ordem.enderecoColeta}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{ordem.enderecoEntrega}</span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="font-bold text-blue-900">{ordem.caixasPequenas}</p>
                        <p className="text-blue-700">Peq</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <p className="font-bold text-orange-900">{ordem.caixasMedias}</p>
                        <p className="text-orange-700">Méd</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="font-bold text-purple-900">{ordem.caixasGrandes}</p>
                        <p className="text-purple-700">Gde</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          setOrdemSelecionada(ordem);
                          setViewMode('ordem');
                        }}
                        variant="outline"
                        className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button
                        onClick={() => {
                          const agendamento = agendamentos.find(a => a.id === ordem.id);
                          if (agendamento) {
                            setAgendamentoSelecionado(agendamento);
                            setMostrarFormulario(true);
                          }
                        }}
                        className="bg-gradient-to-r from-[#F5A623] to-[#E59400] hover:from-[#E59400] hover:to-[#D48500]"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Formulário
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {ordensServico.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhuma ordem de serviço disponível hoje</p>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Ordem de Serviço */}
      <AnimatePresence>
        {mostrarFormulario && agendamentoSelecionado && (
          <OrdemServicoForm
            agendamentoId={agendamentoSelecionado.id}
            agendamento={agendamentoSelecionado}
            onClose={() => {
              setMostrarFormulario(false);
              setAgendamentoSelecionado(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}