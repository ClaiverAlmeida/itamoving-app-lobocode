import React from "react";
import { MapPin } from "lucide-react";
import type { OrdemServicoView } from "../../../../../api";
import { ViewField } from "../ViewField";

export function DestinoTabContent({ ordem }: { ordem: OrdemServicoView }) {
  return (
    <div className="mt-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:mt-5 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
        <MapPin className="h-4 w-4 shrink-0" />
        Destinatário (Brasil)
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <ViewField label="Nome completo">{ordem.recipient.brazilName}</ViewField>
        <ViewField label="CPF">{ordem.recipient.brazilCpf}</ViewField>
        <ViewField label="Endereço">
          <span className="inline-flex min-w-0 items-center gap-2 break-words">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {ordem.recipient.brazilAddress.rua}, {ordem.recipient.brazilAddress.numero} - {ordem.recipient.brazilAddress.complemento}, {ordem.recipient.brazilAddress.cep} - {ordem.recipient.brazilAddress.cidade} -  {ordem.recipient.brazilAddress.estado}
          </span>
        </ViewField>
      </div>
    </div>
  );
}

