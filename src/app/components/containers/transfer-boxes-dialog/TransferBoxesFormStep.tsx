import React from "react";
import type { Container } from "../../../api";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { DialogFooter } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Progress } from "../../ui/progress";
import { ScrollArea } from "../../ui/scroll-area";
import { cn } from "../../ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { AlertTriangle, Boxes, Loader2, Package, Weight } from "lucide-react";
import { volumeUseLabel, weightUse } from "./transfer-boxes-dialog.utils";
import type { TransferBoxCandidate } from "./transfer-boxes-dialog.types";

type Props = {
  volRef: number;
  sourceContainer: Container;
  destOptions: Container[];
  candidates: TransferBoxCandidate[];
  targetId: string;
  onTargetId: (id: string) => void;
  letterDraft: string;
  onLetterDraft: (v: string) => void;
  needsTargetLetter: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  selectedWeight: number;
  loadingPreview: boolean;
  onCancel: () => void;
  onReview: () => void;
};

export function TransferBoxesFormStep({
  volRef,
  sourceContainer,
  destOptions,
  candidates,
  targetId,
  onTargetId,
  letterDraft,
  onLetterDraft,
  needsTargetLetter,
  selectedIds,
  onToggle,
  onSelectAll,
  onSelectNone,
  selectedWeight,
  loadingPreview,
  onCancel,
  onReview,
}: Props) {
  const v = volumeUseLabel(sourceContainer, volRef);
  const w = weightUse(sourceContainer);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/10 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-4 w-4" />
          </span>
          Situação atual — {sourceContainer.number}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Referência operacional de {volRef} caixas (informativo).
        </p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" />
              {v.n} caixas
            </span>
            <span className={cn("tabular-nums", v.exceeds && "font-medium text-destructive")}>
              {v.pct.toFixed(0)}% da referência
            </span>
          </div>
          <Progress value={Math.min(v.pct, 100)} className="h-2" />
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Weight className="h-3.5 w-3.5" />
              {w.kg.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
            </span>
            {sourceContainer.fullWeight != null && (
              <span className={cn("tabular-nums", w.exceeds && "font-medium text-destructive")}>
                {w.pct.toFixed(0)}% do bruto ({sourceContainer.fullWeight} kg)
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <Label className="text-sm font-medium">Container de destino</Label>
        <Select value={targetId || "__none__"} onValueChange={(x) => onTargetId(x === "__none__" ? "" : x)}>
          <SelectTrigger className="h-11 w-full rounded-lg border-border/80 bg-background px-3 py-2">
            <SelectValue placeholder="Selecione o container…" />
          </SelectTrigger>
          <SelectContent className="max-w-[min(100vw-1.5rem,26rem)]">
            <SelectItem value="__none__">—</SelectItem>
            {destOptions.map((c) => {
              const vc = volumeUseLabel(c, volRef);
              const wc = weightUse(c);
              const line = [
                `${c.number} · ${c.seal || "sem lacre"}`,
                `${vc.n} cx · vol. ${vc.pct.toFixed(0)}% ref.`,
                c.fullWeight != null ? `peso ${wc.pct.toFixed(0)}% lim.` : null,
                c.volumeLetter ? `letra ${String(c.volumeLetter).toUpperCase()}` : "sem letra",
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <SelectItem key={c.id} value={c.id!} title={line}>
                  {line}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {destOptions.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum outro container disponível para receber caixas.</p>
        )}
      </section>

      {needsTargetLetter && (
        <section className="space-y-3 rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-amber-50/30 p-4 dark:from-amber-950/40 dark:to-transparent dark:border-amber-900/50">
          <p className="text-xs font-medium text-amber-950 dark:text-amber-100 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            O destino ainda não tem letra de volume. Informe uma letra (A–Z) para gerar etiquetas (ex.: 1-B).
          </p>
          <div>
            <Label htmlFor="xfer-letter" className="text-xs">
              Letra do volume
            </Label>
            <Input
              id="xfer-letter"
              maxLength={1}
              className="mt-1.5 h-11 w-16 text-center font-mono text-lg uppercase tracking-widest rounded-lg"
              value={letterDraft}
              onChange={(e) => onLetterDraft(e.target.value)}
            />
          </div>
        </section>
      )}

      <section className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm font-medium">Caixas a transferir</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">Marque as caixas que irão para o destino.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {selectedIds.size} · {selectedWeight.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
            </span>
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onSelectAll}>
              Todas
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onSelectNone}>
              Limpar
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[min(240px,40vh)] rounded-xl border border-border/70 bg-card/30">
          <div className="divide-y divide-border/50 p-1.5">
            {candidates.map((c) => (
              <label
                key={c.driverServiceOrderProductId}
                className="flex cursor-pointer items-start gap-3.5 rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedIds.has(c.driverServiceOrderProductId)}
                  onCheckedChange={() => onToggle(c.driverServiceOrderProductId)}
                  className="mt-1.5"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug tracking-tight">{c.label}</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{c.orderContext}</p>
                </div>
                <span className="shrink-0 self-center text-xs tabular-nums text-muted-foreground">
                  {c.weightKg.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
        {candidates.length === 0 && (
          <p className="text-sm text-muted-foreground rounded-xl border border-dashed px-3 py-3 text-center">
            Nenhuma caixa listada. Use um container com ordens vinculadas.
          </p>
        )}
      </section>

      <DialogFooter className="gap-2 border-t border-border/50 pt-4 sm:justify-between">
        <Button type="button" variant="outline" className="rounded-lg" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" className="rounded-lg min-w-[160px]" onClick={onReview} disabled={loadingPreview}>
          {loadingPreview ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulando…
            </>
          ) : (
            "Continuar para confirmação"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
