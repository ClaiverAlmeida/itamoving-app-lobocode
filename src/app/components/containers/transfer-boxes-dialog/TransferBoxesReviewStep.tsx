import React from "react";
import { Button } from "../../ui/button";
import { DialogFooter } from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import type { TransferContainerBoxesResult } from "../../../api/services/containers.service";
import { AlertTriangle, ArrowRight, CheckCircle2, Gauge, Loader2, Ship } from "lucide-react";

type Props = {
  volRef: number;
  preview: TransferContainerBoxesResult;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function TransferBoxesReviewStep({ volRef, preview, submitting, onBack, onConfirm }: Props) {
  const warnVolume =
    preview.sourceContainer.boxCountAfter > volRef || preview.targetContainer.boxCountAfter > volRef;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-background p-4 shadow-sm dark:from-emerald-950/30 dark:border-emerald-900/40">
        <p className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Confirme antes de aplicar
        </p>
        <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/80">
          As etiquetas serão atualizadas nos dois containers e a ordem de serviço seguirá o container com mais volumes.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/90 px-3 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Ship className="h-3 w-3" />
              Origem após
            </p>
            <p className="mt-1 font-mono text-sm font-semibold">{preview.sourceContainer.number}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              <span className="tabular-nums font-medium text-foreground">{preview.sourceContainer.boxCountAfter}</span>{" "}
              volumes ·{" "}
              <span className="tabular-nums">
                {preview.sourceContainer.weightKgAfter.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </span>{" "}
              kg
              <br />
              <span className="tabular-nums">{preview.sourceContainer.volumeCapacityAfter}</span> ordem(ns) com carga
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Ship className="h-3 w-3 text-primary" />
              Destino após
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-primary">{preview.targetContainer.number}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              <span className="tabular-nums font-medium text-foreground">{preview.targetContainer.boxCountAfter}</span>{" "}
              volumes ·{" "}
              <span className="tabular-nums">
                {preview.targetContainer.weightKgAfter.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </span>{" "}
              kg
              <br />
              <span className="tabular-nums">{preview.targetContainer.volumeCapacityAfter}</span> ordem(ns) com carga
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-900/80 dark:text-emerald-200/80 mb-2">
            Alteração de etiquetas
          </p>
          <ScrollArea className="h-[min(160px,28vh)] rounded-lg border border-emerald-100/80 bg-background/60 dark:border-emerald-900/30">
            <ul className="divide-y divide-emerald-100/80 text-xs font-mono dark:divide-emerald-900/30">
              {preview.transfers.map((t) => (
                <li
                  key={t.driverServiceOrderProductId}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="truncate text-muted-foreground">{t.oldBoxNumber}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-emerald-600 opacity-70" />
                  <span className="shrink-0 font-medium text-emerald-900 dark:text-emerald-100">{t.newBoxNumber}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>

        {preview.ordersReassigned.length > 0 && (
          <div className="mt-4 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-1.5">
              <Gauge className="h-3 w-3" />
              OS → container principal
            </p>
            <ul className="text-[11px] text-muted-foreground space-y-1">
              {preview.ordersReassigned.map((o) => (
                <li key={o.driverServiceOrderId} className="break-all">
                  Ordem #{o.driverServiceOrderId} → <span className="font-medium text-foreground">{o.containerNumber}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnVolume && (
          <p className="mt-4 flex gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900/50">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Após a operação, pelo menos um container ficará acima da referência de {volRef} volumes.
          </p>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 border-t border-border/50 pt-4 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" className="rounded-lg w-full sm:w-auto" onClick={onBack} disabled={submitting}>
          Voltar e editar
        </Button>
        <Button type="button" className="rounded-lg w-full sm:w-auto min-w-[180px]" onClick={onConfirm} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aplicando…
            </>
          ) : (
            "Confirmar transferência"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
