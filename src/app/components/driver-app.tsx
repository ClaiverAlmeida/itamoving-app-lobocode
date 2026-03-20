import React, { useEffect, useMemo, useState } from "react";
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
import { Estoque, OrdemServicoMotorista } from "../types";
import type { LucideIcon } from "lucide-react";
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
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { stockService, driverAppService } from "../services";
import { AgendamentoConfirmedBackend } from "../services/driver-app.service";

type TruckStockItem = {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBg: string;
  iconClass: string;
  valueClass: string;
};

function formatCollectionDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";

  // Evita bug de timezone com datas no formato "YYYY-MM-DD" (new Date(...) pode virar "dia -1")
  const prefix = dateStr.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(prefix);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const localDate = new Date(year, month - 1, day);
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
  }

  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
}

export default function MotoristaApp() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoConfirmedBackend[]>([]);
  const [estoque, setEstoque] = useState<Estoque>({
    smallBoxes: 0,
    mediumBoxes: 0,
    largeBoxes: 0,
    personalizedItems: 0,
    adhesiveTape: 0,
  });

  useEffect(() => {
    const carregar = async () => {
      const [agendamentosResult, estoqueResult] = await Promise.all([
        driverAppService.getConfirmedAppointments(),
        stockService.getAll(),
      ]);

      if (agendamentosResult.success && agendamentosResult.data) {
        setAgendamentos(agendamentosResult.data);
      }

      if (estoqueResult.success && estoqueResult.data) {
        const arr = (estoqueResult.data as any)?.data;
        const first = Array.isArray(arr) ? arr[0] : null;
        if (first) setEstoque(first as Estoque);
      }
    };

    void carregar();
  }, []);

  const [viewMode, setViewMode] = useState<"lista" | "form" | "recibo">("lista");
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [ordemConcluida, setOrdemConcluida] = useState<OrdemServicoMotorista | null>(null);

  // Filter confirmed agendamentos
  const agendamentosConfirmados = agendamentos.filter((a) => a.status === "CONFIRMED");

  const estoqueCaminhaoItens = useMemo<TruckStockItem[]>(
    () => [
      {
        label: "Pequenas",
        value: estoque.smallBoxes,
        Icon: Box,
        iconBg: "bg-red-50 dark:bg-red-950/40",
        iconClass: "text-red-600 dark:text-red-400",
        valueClass: "text-red-900 dark:text-red-100",
      },
      {
        label: "Médias",
        value: estoque.mediumBoxes,
        Icon: Package,
        iconBg: "bg-green-50 dark:bg-green-950/40",
        iconClass: "text-green-600 dark:text-green-400",
        valueClass: "text-green-900 dark:text-green-100",
      },
      {
        label: "Grandes",
        value: estoque.largeBoxes,
        Icon: Box,
        iconBg: "bg-orange-50 dark:bg-orange-950/40",
        iconClass: "text-orange-600 dark:text-orange-400",
        valueClass: "text-orange-900 dark:text-orange-100",
      },
      {
        label: "Personalizados",
        value: estoque.personalizedItems,
        Icon: Box,
        iconBg: "bg-purple-50 dark:bg-purple-950/40",
        iconClass: "text-purple-600 dark:text-purple-400",
        valueClass: "text-purple-900 dark:text-purple-100",
      },
      {
        label: "Fitas",
        value: estoque.adhesiveTape,
        Icon: Package,
        iconBg: "bg-blue-50 dark:bg-blue-950/40",
        iconClass: "text-blue-600 dark:text-blue-400",
        valueClass: "text-blue-900 dark:text-blue-100",
      },
    ],
    [
      estoque.smallBoxes,
      estoque.mediumBoxes,
      estoque.largeBoxes,
      estoque.personalizedItems,
      estoque.adhesiveTape,
    ],
  );

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
      total: ordem.boxes.length
    };

    ordem.boxes.forEach(c => {
      const tipo = c.type.toLowerCase();
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
                  {ordemConcluida.remetente.usaName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Telefone:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.remetente.usaPhone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Origem:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.remetente.usaAddress.rua} {ordemConcluida.remetente.usaAddress.numero}, {ordemConcluida.remetente.usaAddress.cidade} - {ordemConcluida.remetente.usaAddress.estado}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Destino:
                </span>
                <span className="font-semibold">
                  {ordemConcluida.destinatario.brazilAddress.rua}, {ordemConcluida.destinatario.brazilAddress.cidade} - {ordemConcluida.destinatario.brazilAddress.estado}
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
                {ordemConcluida.valorCobrado ? ordemConcluida.valorCobrado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "$ 0,00"}
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
          {agendamentosConfirmados.length} {agendamentosConfirmados.length === 1 ? "ordem" : "ordens"}
        </Badge>
      </div>

      {/* Estoque Disponível — 5 tipos: grade 2 cols (mobile) → 3 (tablet) → 5 (desktop) */}
      <Card className="overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/80 dark:from-blue-950/30 dark:via-background dark:to-blue-950/20 dark:border-blue-900/50">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl text-[#1E3A5F] dark:text-blue-100">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-400/15">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            Estoque disponível
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Quantidades por tipo de item no estoque
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {estoqueCaminhaoItens.map(({ label, value, Icon, iconBg, iconClass, valueClass }) => (
              <li
                key={label}
                className="flex min-w-0 flex-col items-center rounded-xl border border-slate-200/80 bg-white p-3 text-center shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 sm:p-4"
              >
                <div
                  className={`mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${iconBg}`}
                >
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${iconClass}`} strokeWidth={2} />
                </div>
                <p className={`text-2xl font-bold tabular-nums sm:text-3xl ${valueClass}`}>
                  {value}
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-tight text-muted-foreground sm:text-sm">
                  {label}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Lista de Ordens */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {agendamentosConfirmados.map((agendamento, index) => {
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
                          {agendamento.client?.usaName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {agendamento.client.usaPhone ?? ""}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[#1E3A5F] border-[#1E3A5F]">
                          {agendamento.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                        </Badge>
                        <Badge variant="outline" className={`${agendamento.isPeriodic ? "bg-green-50 text-green-600 border-green-600" : "bg-blue-50 text-blue-600 border-blue-600"}`}>
                          {agendamento.isPeriodic ? "Periódico" : "Único"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {formatCollectionDate(agendamento.collectionDate)}{" "}

                        {
                          agendamento.collectionTime
                            ? `às ${agendamento.collectionTime}`
                            : '- Sem horário de coleta'
                        }
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <Home className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        <span className="font-semibold text-xs text-muted-foreground mr-1">COLETA:</span>
                        {agendamento.client.usaAddress.rua} {agendamento.client.usaAddress.numero}, {agendamento.client.usaAddress.cidade} - {agendamento.client.usaAddress.estado}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        <span className="font-semibold text-xs text-muted-foreground mr-1">ENTREGA:</span>
                        {agendamento.company.address}
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