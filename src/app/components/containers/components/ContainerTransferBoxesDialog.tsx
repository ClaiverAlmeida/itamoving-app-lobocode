import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { cn } from "../../ui/utils";
import { ArrowRightLeft } from "lucide-react";
import { useTransferBoxesDialog } from "../transfer-boxes-dialog/useTransferBoxesDialog";
import { TransferBoxesFormStep } from "../transfer-boxes-dialog/TransferBoxesFormStep";
import { TransferBoxesReviewStep } from "../transfer-boxes-dialog/TransferBoxesReviewStep";
import type { ContainerTransferBoxesDialogProps } from "../transfer-boxes-dialog/transfer-boxes-dialog.types";

export type { TransferBoxCandidate } from "../transfer-boxes-dialog/transfer-boxes-dialog.types";

export function ContainerTransferBoxesDialog(props: ContainerTransferBoxesDialogProps) {
  const {
    open,
    onOpenChange,
    sourceContainer,
    allContainers,
    candidates,
    initialSelectedIds,
    onCompleted,
  } = props;

  const ctx = useTransferBoxesDialog({
    open,
    sourceContainer,
    allContainers,
    candidates,
    initialSelectedIds,
    onCompleted,
    onOpenChange,
  });

  const stepIndex = ctx.step === "form" ? 1 : 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="border-b border-border/60 bg-gradient-to-r from-slate-50/90 via-background to-primary/[0.06] px-6 py-5 dark:from-slate-950/50 dark:via-background dark:to-primary/10">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm ring-1 ring-primary/10">
                <ArrowRightLeft className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold tracking-tight">Transferir caixas</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{sourceContainer.number}</p>
              </div>
            </div>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Escolha o destino e as caixas. Na etapa seguinte você confirma etiquetas e impacto em peso e ordens antes de
              aplicar.
            </DialogDescription>
            <ol className="flex gap-2 pt-1" aria-label="Etapas">
              {[
                { n: 1, label: "Configurar" },
                { n: 2, label: "Confirmar" },
              ].map((s) => (
                <li
                  key={s.n}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                    stepIndex === s.n
                      ? "border-primary/40 bg-primary/10 font-medium text-foreground"
                      : "border-border/60 bg-muted/20 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      stepIndex === s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s.n}
                  </span>
                  {s.label}
                </li>
              ))}
            </ol>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 max-h-[min(72vh,640px)] overflow-y-auto">
          {ctx.step === "form" && (
            <TransferBoxesFormStep
              volRef={ctx.volRef}
              sourceContainer={sourceContainer}
              destOptions={ctx.destOptions}
              candidates={candidates}
              targetId={ctx.targetId}
              onTargetId={ctx.setTargetId}
              letterDraft={ctx.letterDraft}
              onLetterDraft={ctx.setLetterDraft}
              needsTargetLetter={ctx.needsTargetLetter}
              selectedIds={ctx.selectedIds}
              onToggle={ctx.toggle}
              onSelectAll={ctx.selectAll}
              onSelectNone={ctx.selectNone}
              selectedWeight={ctx.selectedWeight}
              loadingPreview={ctx.loadingPreview}
              onCancel={() => onOpenChange(false)}
              onReview={() => void ctx.runPreview()}
            />
          )}

          {ctx.step === "review" && ctx.preview && (
            <TransferBoxesReviewStep
              volRef={ctx.volRef}
              preview={ctx.preview}
              submitting={ctx.submitting}
              onBack={ctx.goBackToForm}
              onConfirm={() => void ctx.executeTransfer()}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
