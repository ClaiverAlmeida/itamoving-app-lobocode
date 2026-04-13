import React from "react";
import { eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { motion } from "motion/react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Box, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { cn } from "../../ui/utils";
import type { Appointment } from "../../../api";
import { parseDateOnlyLocal } from "../../../utils";

const BORDER_LEFT_CLASS_BY_STATUS_COLOR: Record<string, string> = {
  "bg-yellow-500": "border-l-yellow-600",
  "bg-green-500": "border-l-green-600",
  "bg-blue-500": "border-l-blue-600",
  "bg-red-500": "border-l-red-600",
};

type Props = {
  filteredAgendamentos: Appointment[];
  getStatusConfig: (status: string) => {
    label: string;
    color: string;
    textColor: string;
    bgLight: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  setSelectedAgendamento: (ag: Appointment) => void;
  setIsSidePanelOpen: (open: boolean) => void;
};

export function AppointmentsTimelineView({
  filteredAgendamentos,
  getStatusConfig,
  setSelectedAgendamento,
  setIsSidePanelOpen,
}: Props) {
  const weekStart = startOfWeek(new Date(), { locale: ptBR });
  const weekEnd = endOfWeek(new Date(), { locale: ptBR });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-4">
      {daysOfWeek.map((day) => {
        const dayAgendamentos = filteredAgendamentos.filter((ag) =>
          isSameDay(parseDateOnlyLocal((ag.collectionDate ?? "").slice(0, 10)), day),
        );

        return (
          <Card key={day.toString()} className={`${isToday(day) ? "border-blue-500 border-2" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription>{dayAgendamentos.length} agendamento(s)</CardDescription>
                </div>
                {isToday(day) && <Badge className="bg-blue-500">Hoje</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {dayAgendamentos.length > 0 ? (
                <div className="space-y-2">
                  {dayAgendamentos
                    .sort((a, b) => a.collectionTime.localeCompare(b.collectionTime))
                    .map((agendamento) => {
                      const config = getStatusConfig(agendamento.status);
                      const StatusIcon = config.icon;
                      const borderLeftClass = BORDER_LEFT_CLASS_BY_STATUS_COLOR[config.color] ?? "border-l-slate-400";

                      return (
                        <motion.div
                          key={agendamento.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border-l-4 ${config.bgLight} ${borderLeftClass} hover:shadow-md transition-all cursor-pointer`}
                          onClick={() => {
                            setSelectedAgendamento(agendamento);
                            setIsSidePanelOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-full ${config.color} bg-opacity-20`}>
                                <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{agendamento.collectionTime}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span>{agendamento.client.name}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span className="break-words leading-relaxed">{agendamento.client.usaAddress}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Box className="w-3 h-3" />
                                  <span className="break-words">{agendamento.qtyBoxes} Caixa(s)</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "inline-flex w-fit items-center gap-1 whitespace-nowrap border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
                                  agendamento.isPeriodic
                                    ? "border-indigo-200/90 bg-indigo-50 text-indigo-900 dark:border-indigo-800/50 dark:bg-indigo-950/45 dark:text-indigo-100"
                                    : "border-slate-300/80 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200",
                                )}
                              >
                                {agendamento.isPeriodic ? (
                                  <CalendarIcon className="h-3 w-3 text-indigo-700 dark:text-indigo-300" />
                                ) : (
                                  <Box className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                )}
                                {agendamento.isPeriodic ? "Periódico" : "Único"}
                              </Badge>
                              <Badge className={config.bgLight}>
                                <span className={config.textColor}>{config.label}</span>
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhum agendamento para este dia</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
