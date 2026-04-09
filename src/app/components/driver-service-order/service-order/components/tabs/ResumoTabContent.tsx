import React from "react";
import { FileText, Truck } from "lucide-react";
import { Badge } from "../../../../ui/badge";
import type { DriverServiceOrderView } from "../../../../../api";
import { STATUS_LABEL } from "../../service-order.constants";
import { formatDateTime, formatUsd, statusBadgeClass } from "../../service-order.utils";

export function ResumoTabContent({ ordem }: { ordem: DriverServiceOrderView }) {
  return (
    <div className="mt-4 space-y-4 sm:mt-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
          <Badge variant="outline" className={`mt-2 border font-medium ${statusBadgeClass(ordem.status)}`}>
            {STATUS_LABEL[ordem.status]}
          </Badge>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Valor cobrado</p>
          <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-[#1E3A5F]">
            {formatUsd((ordem.cashReceivedUsd ?? 0) + (ordem.zelleReceivedUsd ?? 0))}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Motorista</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
              <Truck className="h-4 w-4" />
            </span>
            <span className="min-w-0">{ordem.driverName || "—"}</span>
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#1E3A5F]">Assinatura do Cliente</p>
          {ordem.clientSignature ? (
            <img
              src={ordem.clientSignature}
              alt="Assinatura do cliente"
              className="h-14 w-full rounded-md border border-border/60 bg-background object-contain mt-2 user-select-none select-none pointer-events-none"
            />
          ) : (
            <div className="h-14 w-full rounded-md border border-border/60 bg-background text-center text-xs text-muted-foreground flex items-center justify-center">
              —
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#1E3A5F]">Assinatura do Agente</p>
          {ordem.agentSignature ? (
            <img
              src={ordem.agentSignature}
              alt="Assinatura do agente"
              className="h-14 w-full rounded-md border border-border/60 bg-background object-contain mt-2 user-select-none select-none pointer-events-none"
            />
          ) : (
            <div className="h-14 w-full rounded-md border border-border/60 bg-background text-center text-xs text-muted-foreground flex items-center justify-center">
              —
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#1E3A5F]">Data de assinatura</p>
          <p className="mt-2 text-sm text-foreground">{formatDateTime(ordem.signatureDate)}</p>
        </div>
      </div>
      {ordem.observations ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Observações
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{ordem.observations}</p>
        </div>
      ) : null}
    </div>
  );
}

