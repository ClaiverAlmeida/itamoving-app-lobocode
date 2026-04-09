import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { Estoque, DriverServiceOrder } from "../../api";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Phone,
  Box,
  Home,
} from "lucide-react";
import type { AgendamentoConfirmedBackend } from "../../api";
import { useNavigate } from "react-router-dom";
import {
  CARD_ESTIMATED_HEIGHT,
  WINDOW_OVERSCAN,
  WINDOW_SIZE,
  driverAppCrud,
  formatCollectionDate,
  formatDriverColetaUsaLine,
  type TruckStockItem,
} from "./driver-app/index";
import { orDash } from "../clients/clients.display";

const OrdemServicoForm = lazy(() => import("./service-order-form"));
const DeliveryReceipt = lazy(async () => {
  const mod = await import("./delivery-receipt");
  return { default: mod.DeliveryReceipt };
});

export default function MotoristaApp() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<AgendamentoConfirmedBackend[]>([]);
  const [estoque, setEstoque] = useState<Estoque>({
    smallBoxes: 0,
    mediumBoxes: 0,
    largeBoxes: 0,
    personalizedItems: 0,
    adhesiveTape: 0,
  });

  /** Permite chamar `carregar` de fora do `useEffect` (ex.: após salvar ordem) sem `useCallback`. */
  const carregarAgendamentosEEstoqueRef = useRef<() => Promise<void>>(async () => { });

  useEffect(() => {
    const carregar = async () => {
      const [agendamentosResult, estoqueResult] = await Promise.all([
        driverAppCrud.getConfirmedAppointments(),
        driverAppCrud.getStock(),
      ]);

      if (agendamentosResult.success && agendamentosResult.data) {
        setAgendamentos(agendamentosResult.data);
      }

      if (estoqueResult.success && estoqueResult.data) {
        const first = Array.isArray(estoqueResult.data) ? estoqueResult.data[0] : null;
        if (first) setEstoque(first as Estoque);
      }
    };

    carregarAgendamentosEEstoqueRef.current = carregar;
    void carregar();
  }, []);

  const [viewMode, setViewMode] = useState<"lista" | "form" | "recibo">("lista");
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [ordemConcluida, setOrdemConcluida] = useState<DriverServiceOrder | null>(null);

  // Filter confirmed agendamentos
  const agendamentosConfirmados = agendamentos.filter((a) => a.status === "CONFIRMED");
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const [listWindowStart, setListWindowStart] = useState(0);

  const windowedAgendamentos = useMemo(() => {
    const start = Math.max(0, listWindowStart - WINDOW_OVERSCAN);
    const end = Math.min(
      agendamentosConfirmados.length,
      listWindowStart + WINDOW_SIZE + WINDOW_OVERSCAN,
    );
    return {
      start,
      end,
      items: agendamentosConfirmados.slice(start, end),
      topSpacer: start * CARD_ESTIMATED_HEIGHT,
      bottomSpacer: Math.max(0, (agendamentosConfirmados.length - end) * CARD_ESTIMATED_HEIGHT),
    };
  }, [agendamentosConfirmados, listWindowStart]);

  const estoqueCaminhaoItens = useMemo<TruckStockItem[]>(
    () => [
      {
        label: "Pequenas",
        value: Number(estoque.smallBoxes) ?? 0,
        Icon: Box,
        iconBg: "bg-red-50 dark:bg-red-950/40",
        iconClass: "text-red-600 dark:text-red-400",
        valueClass: "text-red-900 dark:text-red-100",
      },
      {
        label: "Médias",
        value: Number(estoque.mediumBoxes) ?? 0,
        Icon: Package,
        iconBg: "bg-green-50 dark:bg-green-950/40",
        iconClass: "text-green-600 dark:text-green-400",
        valueClass: "text-green-900 dark:text-green-100",
      },
      {
        label: "Grandes",
        value: Number(estoque.largeBoxes) ?? 0,
        Icon: Box,
        iconBg: "bg-orange-50 dark:bg-orange-950/40",
        iconClass: "text-orange-600 dark:text-orange-400",
        valueClass: "text-orange-900 dark:text-orange-100",
      },
      {
        label: "Personalizados",
        value: Number(estoque.personalizedItems) ?? 0,
        Icon: Box,
        iconBg: "bg-purple-50 dark:bg-purple-950/40",
        iconClass: "text-purple-600 dark:text-purple-400",
        valueClass: "text-purple-900 dark:text-purple-100",
      },
      {
        label: "Fitas",
        value: Number(estoque.adhesiveTape) ?? 0,
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

  const handleFormSave = (ordem: DriverServiceOrder) => {
    setOrdemConcluida(ordem);
    setViewMode("recibo");
  };

  if (viewMode === "recibo" && ordemConcluida) {
    return (
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Carregando recibo...</div>}>
        <DeliveryReceipt
          ordem={ordemConcluida}
          valorAgendamento={
            agendamentoSelecionado?.value != null
              ? Number(agendamentoSelecionado.value)
              : undefined
          }
          valorAntecipacao={
            agendamentoSelecionado?.downPayment != null
              ? Number(agendamentoSelecionado.downPayment)
              : undefined
          }
          companyContactPhone={agendamentoSelecionado?.company?.contactPhone}
          onShowOrdersScreen={() => navigate("/ordem-de-servico")}
          onPrint={() => window.print()}
        />
      </Suspense>
    );
  }

  // If in Form view, render the embedded form
  if (viewMode === "form" && agendamentoSelecionado) {
    return (
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Carregando formulario...</div>}>
        <OrdemServicoForm
          appointmentId={agendamentoSelecionado.id}
          agendamento={agendamentoSelecionado}
          onClose={handleFormClose}
          onSave={handleFormSave}
          onAgendamentosAtualizados={() => void carregarAgendamentosEEstoqueRef.current()}
          embedded={true}
        />
      </Suspense>
    );
  }

  // Default: Lista view
  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Minhas Entregas
          </h2>
          <p className="text-muted-foreground mt-1">
            Agendamentos confirmados para hoje
          </p>
        </div>
        <Badge className="text-base sm:text-lg px-3 sm:px-4 py-2 bg-[#F5A623] w-fit">
          {agendamentosConfirmados.length} {agendamentosConfirmados.length === 1 ? "agendamento" : "agendamentos"}
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
      <div
        ref={listScrollRef}
        className="max-h-[72vh] overflow-y-auto pr-1"
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          const next = Math.floor(scrollTop / CARD_ESTIMATED_HEIGHT) * 2;
          if (next !== listWindowStart) setListWindowStart(next);
        }}
      >
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {windowedAgendamentos.topSpacer > 0 && (
            <div
              className="md:col-span-2"
              style={{ height: windowedAgendamentos.topSpacer }}
              aria-hidden
            />
          )}
        <AnimatePresence>
          {windowedAgendamentos.items.map((agendamento, index) => {
            return (
              <motion.div
                key={agendamento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all border-l-4 border-l-[#F5A623] h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-2 sm:gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg break-words leading-tight">
                          {orDash(agendamento.client?.usaName)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 min-w-0">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{orDash(agendamento.client?.usaPhone)}</span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end justify-start gap-1 w-full sm:w-[230px] sm:justify-self-end">
                        <Badge variant="outline" className="text-[#1E3A5F] border-[#1E3A5F] text-[11px] sm:text-xs justify-center w-full">
                          {agendamento.status === "CONFIRMED" ? "Agendamento Confirmado" : "Agendamento Pendente"}
                        </Badge>
                        <Badge variant="outline" className={`${agendamento.isPeriodic ? "bg-green-50 text-green-600 border-green-600" : "bg-blue-50 text-blue-600 border-blue-600"} text-[11px] sm:text-xs justify-center w-full`}>
                          {agendamento.isPeriodic ? "Agendamento Periódico" : "Agendamento Único"}
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
                        {formatDriverColetaUsaLine(agendamento.client?.usaAddress)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        <span className="font-semibold text-xs text-muted-foreground mr-1">ENTREGA:</span>
                        {orDash(agendamento.company?.address)}
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
          {windowedAgendamentos.bottomSpacer > 0 && (
            <div
              className="md:col-span-2"
              style={{ height: windowedAgendamentos.bottomSpacer }}
              aria-hidden
            />
          )}
        </div>
      </div>

      {agendamentosConfirmados.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Nenhum agendamento confirmado e disponível para hoje
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}