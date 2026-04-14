import React from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Appointment } from "../../../api";
import { parseDateOnlyLocal } from "../../../utils";
import { DASHBOARD_APPOINTMENT_STATUS_STYLE_MAP } from "../dashboard.constants";
import { DashboardAppointmentStatusBadge } from "./DashboardAppointmentStatusBadge";

export function DashboardNextAppointmentsCard({
  agendamentos,
  onNavigate,
}: {
  agendamentos: Appointment[];
  onNavigate?: (view: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>Coletas programadas para os próximos dias</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onNavigate?.("agendamentos")}>
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {agendamentos.slice(0, 6).map((agendamento) => {
            const dateRaw = agendamento.collectionDate ?? "";
            const dateStr = dateRaw.slice(0, 10);
            const dataAgendamento = dateStr.length === 10 ? parseDateOnlyLocal(dateStr) : null;
            const ehHoje = dataAgendamento ? isToday(dataAgendamento) : false;
            const ehAmanha = dataAgendamento ? isTomorrow(dataAgendamento) : false;
            const statusStyle = DASHBOARD_APPOINTMENT_STATUS_STYLE_MAP[agendamento.status];

            return (
              <motion.div key={agendamento.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className={`hover:shadow-lg transition-all border-l-4 ${statusStyle.cardBorder} ${statusStyle.cardBg}`}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm break-words">{(agendamento as any).client?.name}</h4>
                        <DashboardAppointmentStatusBadge status={agendamento.status} />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{dataAgendamento ? format(dataAgendamento, "dd/MM/yyyy", { locale: ptBR }) : "--/--/----"}</span>
                        {ehHoje && <Badge className="bg-green-500 text-white text-xs">Hoje</Badge>}
                        {ehAmanha && <Badge className="bg-blue-500 text-white text-xs">Amanhã</Badge>}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{(agendamento as any).collectionTime}</span>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 break-words">
                          {(agendamento as any).address ?? (agendamento as any).client?.usaAddress ?? "Endereço não informado"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {agendamentos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum agendamento encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

