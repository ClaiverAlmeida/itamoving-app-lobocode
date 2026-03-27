import React from "react";
import { AlertCircle, Box, Calendar, CalendarIcon, MapPin, Phone } from "lucide-react";
import type { OrdemServicoView } from "../../../../../api";
import { agendamentoResumoParaExibicao, formatCollectionDate } from "../../service-order.utils";
import { ViewField } from "../ViewField";
import { cn } from "../../../../ui/utils";
import { Badge } from "../../../../ui/badge";

export function AgendamentoTabContent({ ordem }: { ordem: OrdemServicoView }) {
  const agResumo = agendamentoResumoParaExibicao(ordem);
  if (!agResumo) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-950 sm:mt-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Resumo de agendamento indisponível</p>
          <p className="mt-1 text-sm opacity-90">
            Só temos o identificador nesta resposta: <span className="font-mono">{ordem.appointmentId}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:mt-5 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
        <Calendar className="h-4 w-4 shrink-0" />
        Agendamento vinculado
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <ViewField label="Coleta">
          <span>
            {formatCollectionDate(agResumo.collectionDate)}
            {agResumo.collectionTime ? ` às ${agResumo.collectionTime}` : ""}
          </span>
        </ViewField>
        <ViewField label="Tipo">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex w-fit items-center gap-1 whitespace-nowrap border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
              agResumo.isPeriodic
                ? "border-indigo-200/90 bg-indigo-50 text-indigo-900 dark:border-indigo-800/50 dark:bg-indigo-950/45 dark:text-indigo-100"
                : "border-slate-300/80 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200",
            )}
          >
            {agResumo.isPeriodic ? (
              <CalendarIcon className="h-3 w-3 text-indigo-700 dark:text-indigo-300" />
            ) : (
              <Box className="h-3 w-3 text-slate-600 dark:text-slate-400" />
            )}
            {agResumo.isPeriodic ? "Periódico" : "Único"}
          </Badge>
        </ViewField>
        <ViewField label="Endereço / base (empresa)">
          <span className="inline-flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {agResumo.companyAddress}
          </span>
        </ViewField>
        <ViewField label="Contato da empresa">
          <span className="inline-flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {agResumo.companyPhone ? agResumo.companyPhone : "-"}
          </span>
        </ViewField>
      </div>
    </div >
  );
}

