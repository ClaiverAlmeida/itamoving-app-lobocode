import { AlertCircle, Calendar } from "lucide-react";
import type { OrdemServicoView } from "../../../../../api";
import { agendamentoResumoParaExibicao, formatCollectionDate } from "../../service-order.utils";
import { ViewField } from "../ViewField";

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
      </div>
    </div>
  );
}

