import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { AnimatePresence, motion } from "motion/react";
import { Agendamento, CreateAppointmentsPeriodsDTO } from "../../../api";
import { Calendar } from "../../ui/calendar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Box, Calendar as CalendarIcon, MapPin, Navigation, User } from "lucide-react";
import { cn } from "../../ui/utils";
import { formatDateOnlyToBR } from "../../../utils";
import { AppointmentsListView } from "./AppointmentsListView";
import { AppointmentsTimelineView } from "./AppointmentsTimelineView";
import { ViewMode } from "../appointments.constants";

const BORDER_LEFT_CLASS_BY_STATUS_COLOR: Record<string, string> = {
  "bg-yellow-500": "border-l-yellow-600",
  "bg-green-500": "border-l-green-600",
  "bg-blue-500": "border-l-blue-600",
  "bg-red-500": "border-l-red-600",
};

type Props = {
  viewMode: ViewMode;
  selectedPeriod: CreateAppointmentsPeriodsDTO | null;
  selectedDayInPeriod: Date | null;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setSelectedDayInPeriod: (date: Date | null) => void;
  getDateLabel: (date: Date) => string;
  getDatesWithAgendamentos: () => Date[];
  getDatesWithGrupoEUnico: () => Date[];
  getDatesUnicoDentroDePeriodo: () => Date[];
  getDatesInPeriodRangeOnlyNoHalfHalf: () => Date[];
  getDatesWithAppointmentsInPeriodNoHalfHalf: () => Date[];
  getDatesHojeComAgendamentoHalf: () => Date[];
  agendamentosDoPeriodoNoDia: Agendamento[];
  agendamentosDoPeriodo: Agendamento[];
  agendamentosDosDia: Agendamento[];
  somaCaixasDoPeriodoNoDia: number;
  somaCaixasDosDia: number;
  setSelectedAgendamento: (ag: Agendamento) => void;
  setIsSidePanelOpen: (open: boolean) => void;
  getStatusConfig: (status: string) => {
    label: string;
    color: string;
    textColor: string;
    bgLight: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  filteredAgendamentos: Agendamento[];
  renderedAgendamentosList: Agendamento[];
  sortedFilteredAgendamentos: Agendamento[];
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  listVisibleCount: number;
  setListVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  getStatusKey: (status: string) => string;
};

export function AppointmentsContentView(props: Props) {
  const {
    viewMode,
    selectedPeriod,
    selectedDayInPeriod,
    selectedDate,
    setSelectedDate,
    setSelectedDayInPeriod,
    getDateLabel,
    getDatesWithAgendamentos,
    getDatesWithGrupoEUnico,
    getDatesUnicoDentroDePeriodo,
    getDatesInPeriodRangeOnlyNoHalfHalf,
    getDatesWithAppointmentsInPeriodNoHalfHalf,
    getDatesHojeComAgendamentoHalf,
    agendamentosDoPeriodoNoDia,
    agendamentosDoPeriodo,
    agendamentosDosDia,
    somaCaixasDoPeriodoNoDia,
    somaCaixasDosDia,
    setSelectedAgendamento,
    setIsSidePanelOpen,
    getStatusConfig,
    filteredAgendamentos,
    renderedAgendamentosList,
    sortedFilteredAgendamentos,
    listContainerRef,
    listVisibleCount,
    setListVisibleCount,
    getStatusKey,
  } = props;

  return (
    <>
      {viewMode === "calendar" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>Selecione uma data</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedPeriod ? (selectedDayInPeriod ?? undefined) : selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  if (selectedPeriod) {
                    const isSame = selectedDayInPeriod && format(date, "yyyy-MM-dd") === format(selectedDayInPeriod, "yyyy-MM-dd");
                    setSelectedDayInPeriod(isSame ? null : date);
                  } else {
                    setSelectedDate(date);
                  }
                }}
                locale={ptBR}
                className="rounded-md border calendar-appointments"
                numberOfMonths={1}
                classNames={{
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-md",
                  day: "rdp-day size-8 p-0 font-normal aria-selected:opacity-100 rounded-md cursor-pointer",
                  day_today: "calendar-day-today",
                  day_selected: "calendar-day-selected",
                }}
                modifiers={{
                  ...(!selectedPeriod ? { agendado: getDatesWithAgendamentos() } : {}),
                  ...(selectedPeriod
                    ? {
                        diaGrupoEUnico: getDatesWithGrupoEUnico(),
                        diaUnicoDentroPeriodo: getDatesUnicoDentroDePeriodo(),
                        periodInterval: getDatesInPeriodRangeOnlyNoHalfHalf(),
                        periodAppointmentDay: getDatesWithAppointmentsInPeriodNoHalfHalf(),
                      }
                    : {}),
                  hojeUnicoHalf: getDatesHojeComAgendamentoHalf(),
                }}
                modifiersClassNames={{
                  ...(!selectedPeriod ? { agendado: "calendar-day-agendado" } : {}),
                  ...(selectedPeriod
                    ? {
                        diaGrupoEUnico: "calendar-day-period-interval",
                        diaUnicoDentroPeriodo: "calendar-day-period-interval",
                        periodInterval: "calendar-day-period-interval",
                        periodAppointmentDay: "calendar-day-period-appointment",
                      }
                    : {}),
                  hojeUnicoHalf: "calendar-day-today-unico-half",
                }}
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{selectedPeriod ? selectedPeriod.title : getDateLabel(selectedDate)}</CardTitle>
              <CardDescription>
                <span className="flex flex-col items-start gap-2 text-sm text-muted-foreground mt-2">
                  {selectedPeriod ? (
                    <>
                      <span className="text-foreground">
                        {selectedPeriod.startDate && selectedPeriod.endDate
                          ? `${formatDateOnlyToBR(selectedPeriod.startDate.slice(0, 10))} - ${formatDateOnlyToBR(selectedPeriod.endDate.slice(0, 10))}`
                          : "-"}
                      </span>
                      <span className="font-bold text-foreground">
                        {selectedDayInPeriod ? (
                          <>Dia: {format(selectedDayInPeriod, "dd/MM/yyyy", { locale: ptBR })} • {agendamentosDoPeriodoNoDia.length} agendamento(s){agendamentosDoPeriodoNoDia.length > 0 && ` • ${somaCaixasDoPeriodoNoDia} caixa(s)`}</>
                        ) : (
                          <>{agendamentosDoPeriodo.length} agendamento(s) no período{agendamentosDoPeriodo.length > 0 && ` • ${agendamentosDoPeriodo.reduce((acc, a) => acc + (a.qtyBoxes ?? 0), 0)} caixa(s)`}</>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-foreground">{agendamentosDosDia.length} agendamento(s) programado(s)</span>
                      <span className="font-bold text-foreground">{somaCaixasDosDia} Caixa(s) do dia.</span>
                    </>
                  )}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPeriod && selectedDayInPeriod && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedDayInPeriod(null)}>
                    Ver todos os dias do período
                  </Button>
                )}
                <AnimatePresence>
                  {(selectedPeriod ? (selectedDayInPeriod ? agendamentosDoPeriodoNoDia : agendamentosDoPeriodo) : agendamentosDosDia)
                    .slice()
                    .sort((a, b) => {
                      if (selectedPeriod && !selectedDayInPeriod) {
                        const dateCmp = (a.collectionDate ?? "").localeCompare(b.collectionDate ?? "");
                        if (dateCmp !== 0) return dateCmp;
                      }
                      return (a.collectionTime ?? "").localeCompare(b.collectionTime ?? "");
                    })
                    .map((agendamento) => {
                      const config = getStatusConfig(agendamento.status);
                      const StatusIcon = config.icon;
                      const timeLabel = (agendamento.collectionTime ?? "").trim() || "—";
                      const borderLeftClass = BORDER_LEFT_CLASS_BY_STATUS_COLOR[config.color] ?? "border-l-slate-400";
                      return (
                        <motion.div key={agendamento.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group">
                          <Card
                            className={`border-l-4 hover:shadow-xl transition-all cursor-pointer ${config.bgLight} ${borderLeftClass}`}
                            onClick={() => {
                              setSelectedAgendamento(agendamento);
                              setIsSidePanelOpen(true);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-3">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                  <div className={`p-2 rounded-full ${config.color} bg-opacity-20`}>
                                    <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className={cn("break-words", selectedPeriod ? "font-semibold text-base" : "font-semibold text-lg")}>
                                        {selectedPeriod && !selectedDayInPeriod
                                          ? `${formatDateOnlyToBR((agendamento.collectionDate ?? "").slice(0, 10)) || "Sem data"} · ${timeLabel}`
                                          : selectedPeriod && selectedDayInPeriod
                                            ? `${format(selectedDayInPeriod, "dd/MM/yyyy", { locale: ptBR })} · ${timeLabel}`
                                            : (agendamento.collectionTime ?? "").trim() || "—"}
                                      </span>
                                      <Badge className={config.bgLight}>
                                        <span className={config.textColor}>{config.label}</span>
                                      </Badge>
                                    </div>
                                    <h4 className="font-semibold mb-1 break-words">{agendamento.client.name}</h4>
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span className="break-words">{agendamento.client.usaAddress}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1 min-w-0">
                                        <User className="w-3 h-3" />
                                        <span className="break-words">{agendamento.user.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Box className="w-3 h-3 text-foreground" />
                                        <span className="font-bold text-xs text-foreground">{agendamento.qtyBoxes} Caixa(s)</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex w-full sm:w-auto shrink-0 flex-col sm:items-end justify-between self-stretch py-0.5 gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "inline-flex w-fit items-center gap-1 self-start sm:self-end whitespace-nowrap border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
                                      agendamento.isPeriodic
                                        ? "border-indigo-200/90 bg-indigo-50 text-indigo-900 dark:border-indigo-800/50 dark:bg-indigo-950/45 dark:text-indigo-100"
                                        : "border-slate-300/80 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200",
                                    )}
                                  >
                                    {agendamento.isPeriodic ? <CalendarIcon className="h-3 w-3 text-indigo-700 dark:text-indigo-300" /> : <Box className="h-3 w-3 text-slate-600 dark:text-slate-400" />}
                                    {agendamento.isPeriodic ? "Periódico" : "Único"}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto border-blue-200/90 bg-white text-blue-900 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/90 dark:border-blue-900/50 dark:bg-slate-950 dark:text-blue-200 dark:hover:bg-blue-950/40"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agendamento.client.usaAddress)}`, "_blank");
                                    }}
                                  >
                                    <Navigation className="w-4 h-4 mr-1 shrink-0 text-blue-700 dark:text-blue-300" />
                                    Rota
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
                {(selectedPeriod ? (selectedDayInPeriod ? agendamentosDoPeriodoNoDia.length === 0 : agendamentosDoPeriodo.length === 0) : agendamentosDosDia.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{selectedPeriod ? (selectedDayInPeriod ? "Nenhum agendamento neste dia do período" : "Nenhum agendamento neste período") : "Nenhum agendamento para esta data"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "timeline" && (
        <AppointmentsTimelineView
          filteredAgendamentos={filteredAgendamentos}
          getStatusConfig={getStatusConfig}
          setSelectedAgendamento={setSelectedAgendamento}
          setIsSidePanelOpen={setIsSidePanelOpen}
        />
      )}

      <AppointmentsListView
        viewMode={viewMode}
        filteredAgendamentos={filteredAgendamentos}
        renderedAgendamentosList={renderedAgendamentosList}
        sortedFilteredAgendamentos={sortedFilteredAgendamentos}
        listContainerRef={listContainerRef}
        listVisibleCount={listVisibleCount}
        setListVisibleCount={setListVisibleCount}
        setSelectedAgendamento={setSelectedAgendamento}
        setIsSidePanelOpen={setIsSidePanelOpen}
        getStatusConfig={getStatusConfig}
        getStatusKey={getStatusKey}
      />
    </>
  );
}
