import React from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Box, MapPin, MessageCircle, User, X } from "lucide-react";
import { Agendamento, CreateAppointmentsPeriodsDTO } from "../../../api";
import { cn } from "../../ui/utils";
import { formatDateOnlyToBR } from "../../../utils";

const BORDER_LEFT_CLASS_BY_STATUS_COLOR: Record<string, string> = {
  "bg-yellow-500": "border-l-yellow-600",
  "bg-green-500": "border-l-green-600",
  "bg-blue-500": "border-l-blue-600",
  "bg-red-500": "border-l-red-600",
};

type Props = {
  selectedPeriod: CreateAppointmentsPeriodsDTO;
  agendamentosDoPeriodo: Agendamento[];
  getStatusConfig: (status: string) => {
    label: string;
    color: string;
    textColor: string;
    bgLight: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  onClose: () => void;
  onSelectAgendamento: (ag: Agendamento) => void;
};

export function AppointmentsPeriodSidePanelContent({
  selectedPeriod,
  agendamentosDoPeriodo,
  getStatusConfig,
  onClose,
  onSelectAgendamento,
}: Props) {
  return (
    <>
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">{selectedPeriod.title}</h2>
            {selectedPeriod.startDate && selectedPeriod.endDate && (
              <p className="text-sm text-muted-foreground">
                {formatDateOnlyToBR(selectedPeriod.startDate.slice(0, 10))} - {formatDateOnlyToBR(selectedPeriod.endDate.slice(0, 10))}
              </p>
            )}
            {selectedPeriod.collectionArea?.trim() && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {selectedPeriod.collectionArea}
              </p>
            )}
            {selectedPeriod.status && (
              <Badge className={getStatusConfig(selectedPeriod.status).bgLight + " mt-3"} variant="secondary">
                <span className={getStatusConfig(selectedPeriod.status).textColor}>
                  {getStatusConfig(selectedPeriod.status).label}
                </span>
              </Badge>
            )}
            {selectedPeriod.observations && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <MessageCircle className="w-4 h-4 flex-shrink-0" /> {": "}
                {selectedPeriod.observations}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Clientes</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{agendamentosDoPeriodo.length}</p>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Total de caixas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {agendamentosDoPeriodo.reduce((acc, a) => acc + (a.qtyBoxes ?? 0), 0)}
            </p>
          </Card>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Atendentes
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {Array.from(new Set(agendamentosDoPeriodo.map((a) => a.user?.name).filter(Boolean))).map((name) => (
              <li key={name} className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500" />
                {name}
              </li>
            ))}
            {agendamentosDoPeriodo.length > 0 && agendamentosDoPeriodo.every((a) => !a.user?.name) && <li className="text-muted-foreground">-</li>}
            {agendamentosDoPeriodo.length === 0 && <li className="text-muted-foreground">Nenhum agendamento neste período</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Box className="w-4 h-4" />
            Caixas por cliente
          </h3>
          <ul className="space-y-2">
            {agendamentosDoPeriodo
              .slice()
              .sort((a, b) => (b.qtyBoxes ?? 0) - (a.qtyBoxes ?? 0))
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => onSelectAgendamento(a)}
                >
                  <span className="font-medium break-words">{a.client?.name ?? "-"}</span>
                  <Badge variant="secondary">{a.qtyBoxes ?? 0} caixas</Badge>
                </li>
              ))}
            {agendamentosDoPeriodo.length === 0 && <li className="text-sm text-muted-foreground py-2">Nenhum agendamento neste período</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Agendamentos do período</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {agendamentosDoPeriodo
              .slice()
              .sort((a, b) => (a.collectionDate ?? "").localeCompare(b.collectionDate ?? "") || (a.collectionTime ?? "").localeCompare(b.collectionTime ?? ""))
              .map((ag) => {
                const config = getStatusConfig(ag.status);
                const StatusIcon = config.icon;
                const borderLeftClass = BORDER_LEFT_CLASS_BY_STATUS_COLOR[config.color] ?? "border-l-slate-400";
                return (
                  <Card
                    key={ag.id}
                    className={cn("p-3 cursor-pointer border-l-4", config.bgLight, borderLeftClass)}
                    onClick={() => onSelectAgendamento(ag)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusIcon className={cn("w-4 h-4 flex-shrink-0", config.textColor)} />
                        <span className="font-medium break-words">{ag.client?.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{(formatDateOnlyToBR(ag.collectionDate) ?? "").slice(0, 10)}</span>
                        <span>{ag.collectionTime}</span>
                        <Badge variant="outline" className="text-xs">{ag.qtyBoxes} caixa(s)</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 break-words">{ag.user?.name}</p>
                  </Card>
                );
              })}
            {agendamentosDoPeriodo.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhum agendamento neste período</p>}
          </div>
        </div>
      </div>
    </>
  );
}
