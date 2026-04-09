import React, { useState } from "react";
import type { Container } from "../../../api";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ClipboardList, Hash, Link2, Truck } from "lucide-react";
import { cn } from "../../ui/utils";
import { VOLUME_REFERENCIA_INFORMATIVO } from "../containers.constants";
import { ContainerAssignServiceOrderDialog } from "./ContainerAssignServiceOrderDialog";

type Props = {
  container: Container;
  allContainers: Container[];
  onTransferCompleted: (payload: { source: Container; target: Container }) => void | Promise<void>;
  onAssigned: (updated: Container) => void | Promise<void>;
  onUnassignServiceOrder: (containerId: string, driverServiceOrderId: string) => void | Promise<void>;
};

export function ContainerAssignServiceOrderCard({
  container,
  allContainers,
  onTransferCompleted,
  onAssigned,
  onUnassignServiceOrder,
}: Props) {
  const [open, setOpen] = useState(false);
  const linkedFromCount = container.linkedServiceOrderCount;
  const linkedFromArray = container.serviceOrders?.length;
  /** Ordens vinculadas: prioriza contagem/lista vindas da API; evita mostrar `volumeCapacity` obsoleto (ex.: 1) com 0 OS. */
  const linkedCount = linkedFromCount ?? linkedFromArray ?? 0;
  const volumeContador =
    linkedFromCount != null || linkedFromArray != null
      ? linkedCount
      : (container.volumeCapacity ?? 0);
  const volRef = VOLUME_REFERENCIA_INFORMATIVO;
  const boxCount = container.boxes?.length ?? 0;
  const excedeVolumesRef = boxCount > volRef;

  return (
    <>
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="space-y-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-base leading-tight">Ordens de serviço</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Vincule e gerencie ordens deste container.
              </CardDescription>
            </div>
            <Button variant="default" size="sm" className="shrink-0" onClick={() => setOpen(true)}>
              Abrir
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-md border bg-muted/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume (OS)</p>
              <p className="text-sm font-semibold tabular-nums">{volumeContador}</p>
            </div>
            <div className="rounded-md border bg-muted/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Letra</p>
              <p className="text-sm font-semibold font-mono">
                {container.volumeLetter?.toUpperCase() ?? "—"}
              </p>
            </div>
            <div
              className={cn(
                "rounded-md border px-3 py-2 transition-colors",
                excedeVolumesRef
                  ? "border-destructive/45 bg-destructive/5 ring-1 ring-destructive/20"
                  : "border-muted bg-muted/20",
              )}
            >
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volumes</p>
              <p className={cn("text-sm font-semibold tabular-nums", excedeVolumesRef && "text-destructive")}>
                {boxCount}
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Referência</p>
              <p className="text-sm font-semibold tabular-nums">{volRef}</p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">volumes (nota)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 border-t bg-muted/20 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1">
              <Truck className="h-3 w-3" />
              Ordens concluídas sem container
            </span>
            <span className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1">
              <Hash className="h-3 w-3" />
              Numeração contínua (11-A, 12-AA…)
            </span>
            <span className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1">
              <Link2 className="h-3 w-3" />
              Remoção e vínculo no mesmo painel
            </span>
          </div>
        </CardContent>
      </Card>

      <ContainerAssignServiceOrderDialog
        open={open}
        onOpenChange={setOpen}
        container={container}
        allContainers={allContainers}
        onTransferCompleted={onTransferCompleted}
        onSuccess={onAssigned}
        onUnassignServiceOrder={onUnassignServiceOrder}
      />
    </>
  );
}
