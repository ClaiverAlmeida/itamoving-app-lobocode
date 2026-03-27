import React from "react";
import { MapPin, Phone, User } from "lucide-react";
import type { OrdemServicoView } from "../../../../../api";
import { ViewField } from "../ViewField";

export function ClienteTabContent({ ordem }: { ordem: OrdemServicoView }) {
  return (
    <div className="mt-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:mt-5 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
        <User className="h-4 w-4 shrink-0" />
        Remetente (Estados Unidos)
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <ViewField label="Nome completo">{ordem.sender.usaName}</ViewField>
        <ViewField label="Telefone">
          <span className="inline-flex min-w-0 items-center gap-2 break-words">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {ordem.sender.usaPhone}
          </span>
        </ViewField>
        <ViewField label="Endereço">
          <span className="inline-flex min-w-0 items-center gap-2 break-words">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {ordem.sender.usaAddress.rua}, {ordem.sender.usaAddress.numero} - {ordem.sender.usaAddress.complemento}, {ordem.sender.usaAddress.zipCode} - {ordem.sender.usaAddress.cidade} -  {ordem.sender.usaAddress.estado}
          </span>
        </ViewField>
      </div>
    </div>
  );
}

