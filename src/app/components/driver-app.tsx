import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useData } from "../context/DataContext";
import { motion, AnimatePresence } from "motion/react";
import OrdemServicoForm from "./service-order-form";
import { OrdemServicoMotorista } from "../types";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Phone,
  CheckCircle,
  User,
  Box,
  Download,
  Home,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export default function MotoristaApp() {
  const { agendamentos, estoque, clientes } = useData();
  const [viewMode, setViewMode] = useState<"lista" | "form" | "recibo">("lista");
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [ordemConcluida, setOrdemConcluida] = useState<OrdemServicoMotorista | null>(null);

  // Filter confirmed agendamentos
  const agendamentosConfirmados = agendamentos.filter((a) => a.status === "CONFIRMED");

  const handleIniciarAtendimento = (agendamento: any) => {
    setAgendamentoSelecionado(agendamento);
    setViewMode("form");
  };

  const handleFormClose = () => {
    setViewMode("lista");
    setAgendamentoSelecionado(null);
  };

  const handleFormSave = (ordem: OrdemServicoMotorista) => {
    setOrdemConcluida(ordem);
    setViewMode("recibo");
  };

  const imprimirRecibo = () => {
    window.print();
  };

  const countCaixas = (ordem: OrdemServicoMotorista) => {
    const counts = {
      pequenas: 0,
      medias: 0,
      grandes: 0,
      total: ordem.caixas.length
    };
    
    ordem.caixas.forEach(c => {
      const tipo = c.tipo.toLowerCase();
      if (tipo.includes('pequena')) counts.pequenas++;
      else if (tipo.includes('media') || tipo.includes('média')) counts.medias++;
      else if (tipo.includes('grande')) counts.grandes++;
    });
    
    return counts;
  };

  if (viewMode === "recibo" && ordemConcluida) {
    const counts = countCaixas(ordemConcluida);

    return (
      <div className="space-y-6 print:bg-white">
        <div className="flex items-center justify-between print:hidden">
          <Button
            variant="outline"
            onClick={() => {
              setViewMode("lista");
              setOrdemConcluida(null);
            }}
          >
            ← Voltar para Início
          </Button>
          <Button
            onClick={imprimirRecibo}
            className="bg-[#1E3A5F]"
          >
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
              <h1 className="text-3xl font-bold text-[#1E3A5F]">
                ITAMOVING
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Mudanças Internacionais EUA-Brasil
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Miami, FL - São Paulo, SP | Tel: (305) 555-0199
            </p>
          </div>

          {/* Informações do Recibo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1E3A5F]">
                RECIBO DE ENTREGA
              </h2>
              <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                CONCLUÍDO
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Nº Ordem:
                </span>
                <span className="font-semibold ml-2">
                  #{ordemConcluida.id}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Data:
                </span>
                <span className="font-semibold ml-2">
                  {format(new Date(ordemConcluida.dataAssinatura), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Cliente (Remetente)
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Nome:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.remetente.nome}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Telefone:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.remetente.telefone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Origem:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.remetente.endereco}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Destino:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.destinatario.endereco}, {ordemConcluida.destinatario.cidade} - {ordemConcluida.destinatario.estado}
                </span>
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
                  <th className="pb-2 text-center">
                    Quantidade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {counts.pequenas > 0 && (
                  <tr>
                    <td className="py-2">Caixas Pequenas</td>
                    <td className="py-2 text-center font-semibold">
                      {counts.pequenas}
                    </td>
                  </tr>
                )}
                {counts.medias > 0 && (
                  <tr>
                    <td className="py-2">Caixas Médias</td>
                    <td className="py-2 text-center font-semibold">
                      {counts.medias}
                    </td>
                  </tr>
                )}
                {counts.grandes > 0 && (
                  <tr>
                    <td className="py-2">Caixas Grandes</td>
                    <td className="py-2 text-center font-semibold">
                      {counts.grandes}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 font-bold">
                  <td className="py-2">TOTAL DE CAIXAS</td>
                  <td className="py-2 text-center">
                    {counts.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Valor Pago */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-900">
                Valor Pago em Espécie:
              </span>
              <span className="text-2xl font-bold text-green-700">
                {ordemConcluida.valorCobrado ? ordemConcluida.valorCobrado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}
              </span>
            </div>
          </div>

          {/* Assinatura */}
          <div className="border-t-2 border-dashed border-border pt-6">
            <h3 className="font-semibold text-[#1E3A5F] mb-3">
              Assinatura do Cliente:
            </h3>
            {ordemConcluida.assinaturaCliente && (
              <div className="border border-border rounded-lg p-4 bg-gray-50">
                <img
                  src={ordemConcluida.assinaturaCliente}
                  alt="Assinatura"
                  className="h-24 mx-auto"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Declaro que recebi os itens acima relacionados em
              perfeito estado.
            </p>
          </div>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>ITAMOVING - Mudanças Internacionais</p>
            <p>www.itamoving.com | contato@itamoving.com</p>
            <p className="mt-2">
              Este documento comprova a entrega e pagamento dos
              serviços prestados.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // If in Form view, render the embedded form
  if (viewMode === "form" && agendamentoSelecionado) {
    return (
      <OrdemServicoForm
        agendamentoId={agendamentoSelecionado.id}
        agendamento={agendamentoSelecionado}
        onClose={handleFormClose}
        onSave={handleFormSave}
        embedded={true}
      />
    );
  }

  // Default: Lista view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            Minhas Entregas
          </h2>
          <p className="text-muted-foreground mt-1">
            Ordens de serviço confirmadas para hoje
          </p>
        </div>
        <Badge className="text-lg px-4 py-2 bg-[#F5A623]">
          {agendamentosConfirmados.length} ordens
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
              <p className="text-3xl font-bold text-blue-900">
                {estoque.smallBoxes}
              </p>
              <p className="text-sm text-muted-foreground">
                Pequenas
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Package className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-3xl font-bold text-orange-900">
                {estoque.mediumBoxes}
              </p>
              <p className="text-sm text-muted-foreground">
                Médias
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Box className="w-10 h-10 mx-auto text-purple-600 mb-2" />
              <p className="text-3xl font-bold text-purple-900">
                {estoque.largeBoxes}
              </p>
              <p className="text-sm text-muted-foreground">
                Grandes
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Package className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-3xl font-bold text-green-900">
                {estoque.adhesiveTape}
              </p>
              <p className="text-sm text-muted-foreground">
                Fitas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ordens */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {agendamentosConfirmados.map((agendamento, index) => {
            const cliente = clientes.find(c => c.id === agendamento.client?.id);
            return (
              <motion.div
                key={agendamento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all border-l-4 border-l-[#F5A623] h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {agendamento.client?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {cliente?.usaPhone ?? ""}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[#1E3A5F] border-[#1E3A5F]">
                        Agendado
                      </Badge>
                    </div>
                  </CardHeader>
                <CardContent className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(agendamento.collectionDate),
                        "dd/MM/yyyy",
                        { locale: ptBR },
                      )}{" "}
                      às {agendamento.collectionTime}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Home className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      <span className="font-semibold text-xs text-muted-foreground mr-1">COLETA:</span>
                      {agendamento.address}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      <span className="font-semibold text-xs text-muted-foreground mr-1">ENTREGA:</span>
                      {agendamento.address || "Endereço de entrega a definir"}
                    </span>
                  </div>
                </CardContent>
                
                <div className="p-4 pt-0 mt-auto">
                   <Button
                    onClick={() => handleIniciarAtendimento(agendamento)}
                    className="w-full bg-[#1E3A5F] hover:bg-[#2A4A6F] h-12 text-lg"
                  >
                    <Truck className="w-5 h-5 mr-2" />
                    Iniciar Atendimento
                  </Button>
                </div>
              </Card>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {agendamentosConfirmados.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Nenhuma ordem de serviço disponível hoje
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}