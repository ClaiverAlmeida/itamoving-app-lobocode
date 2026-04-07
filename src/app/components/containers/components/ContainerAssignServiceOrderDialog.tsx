import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Container } from "../../../api";
import { serviceOrderFormService } from "../../../api";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { cn } from "../../ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { VOLUME_REFERENCIA_INFORMATIVO } from "../containers.constants";
import { containersCrud } from "../containers.crud";
import {
  buildTransferBoxCandidates,
  filterDriverServiceProductsOnContainer,
  formatProductTypeForDisplay,
  formatServiceOrderBoxLine,
  getContainerBoxLabel,
  getLoosePhysicalBoxes,
  getServiceOrderAssociationCaption,
  linkedDriverServiceOrderIdsToFetch,
  mergeOrderProductWithPhysicalBox,
  serviceOrderSenderDisplayName,
} from "../containers.utils";
import { ServiceOrderBoxesPreview } from "./ServiceOrderBoxesPreview";
import { ContainerBoxItemsList } from "./ContainerBoxItemsList";
import type { DriverServiceOrderView } from "../../../api/services/driver-service-order/service-order-form.service";
import {
  AlertTriangle,
  ArrowRightLeft,
  ChevronDown,
  Container as ContainerIcon,
  Hash,
  Loader2,
  Package,
  PackagePlus,
  Truck,
} from "lucide-react";
import {
  ContainerTransferBoxesDialog,
  type TransferBoxCandidate,
} from "./ContainerTransferBoxesDialog";
import { AtendenteSelect } from "../../forms";
import { useAuth } from "../../../context/AuthContext";
import { UnassignContainerOrderConfirmDialog } from "./UnassignContainerOrderConfirmDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: Container;
  allContainers: Container[];
  onTransferCompleted: (payload: { source: Container; target: Container }) => void | Promise<void>;
  onSuccess: (updated: Container) => void | Promise<void>;
  onUnassignServiceOrder: (containerId: string, driverServiceOrderId: string) => void | Promise<void>;
};

function labelOrdem(o: DriverServiceOrderView): string {
  const nome = o.sender?.usaName?.trim() || "Cliente USA";
  const fullId = o.id ? `#${o.id}` : "#—";
  return `${nome} · ${fullId}`;
}

function SectionLabel({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {step}
      </span>
      <span className="text-sm font-semibold text-foreground">{children}</span>
    </div>
  );
}

export function ContainerAssignServiceOrderDialog({
  open,
  onOpenChange,
  container,
  allContainers,
  onTransferCompleted,
  onSuccess,
  onUnassignServiceOrder,
}: Props) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DriverServiceOrderView[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<DriverServiceOrderView | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedAtendente, setSelectedAtendente] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [linkedDetailsLoading, setLinkedDetailsLoading] = useState(false);
  const [linkedOrderDetails, setLinkedOrderDetails] = useState<Record<string, DriverServiceOrderView>>({});
  /** Container atualizado do servidor ao abrir (letra, caixas, contagem de ordens) para várias vinculações seguidas. */
  const [workingContainer, setWorkingContainer] = useState(container);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferInitialIds, setTransferInitialIds] = useState<string[] | undefined>(undefined);
  const [unassignConfirmOpen, setUnassignConfirmOpen] = useState(false);
  const [pendingUnassignOrderId, setPendingUnassignOrderId] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState(false);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const result = await containersCrud.getAllCompletedAndNotAssignedToContainer();
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        toast.error(result.error ?? "Não foi possível carregar ordens disponíveis.");
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadLinkedOrderDetails = useCallback(async (current: Container) => {
    const orderIds = linkedDriverServiceOrderIdsToFetch(current);
    if (orderIds.length === 0) {
      setLinkedOrderDetails({});
      return;
    }
    setLinkedDetailsLoading(true);
    try {
      const result = await Promise.all(
        orderIds.map(async (id) => {
          const r = await serviceOrderFormService.getById(id);
          return { id, data: r.success ? r.data : null };
        }),
      );
      const next: Record<string, DriverServiceOrderView> = {};
      for (const row of result) {
        if (row.data) {
          next[row.id] = row.data;
        }
      }
      setLinkedOrderDetails(next);
    } finally {
      setLinkedDetailsLoading(false);
    }
  }, []);

  const containerDataSignature = useMemo(
    () =>
      [
        container.id ?? "",
        (container.serviceOrders ?? [])
          .map((o) => o.id)
          .sort()
          .join(","),
        (container.boxes ?? [])
          .map((b) =>
            [b.driverServiceOrderProductId ?? "", b.boxNumber, b.orderPrimaryContainerId ?? ""].join(":"),
          )
          .sort()
          .join("|"),
        String(container.volumeCapacity ?? ""),
        String(container.totalWeight ?? ""),
      ].join("§"),
    [container],
  );

  useEffect(() => {
    if (!open) return;
    void loadList();
    setSelectedId("");
    setDetail(null);
    setSelectedAtendente("");
  }, [open, loadList]);

  useEffect(() => {
    if (!open || !container.id) return;
    setWorkingContainer(container);
    let cancelled = false;
    void containersCrud.getById(container.id).then((r) => {
      if (cancelled) return;
      if (r.success && r.data) {
        setWorkingContainer(r.data);
        void loadLinkedOrderDetails(r.data);
      } else {
        void loadLinkedOrderDetails(container);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, loadLinkedOrderDetails, containerDataSignature]);

  useEffect(() => {
    if (!open || !selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    void serviceOrderFormService.getById(selectedId).then((result) => {
      if (cancelled) return;
      setLoadingDetail(false);
      if (result.success && result.data) {
        setDetail(result.data);
      } else {
        setDetail(null);
        toast.error(result.error ?? "Erro ao carregar a ordem.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, selectedId]);

  const letterEfetiva = (workingContainer.volumeLetter?.trim().toUpperCase() || "") as string;

  const boxNumbersExistentes = useMemo(
    () => (workingContainer.boxes ?? []).map((b) => b.boxNumber),
    [workingContainer.boxes],
  );

  const nCaixasOrdem = detail?.driverServiceOrderProducts?.length ?? 0;

  const [previewLabels, setPreviewLabels] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const boxNumbersKey = useMemo(
    () => [...boxNumbersExistentes].sort().join("\u0001"),
    [boxNumbersExistentes],
  );

  useEffect(() => {
    if (!open || !detail || !letterEfetiva || nCaixasOrdem <= 0) {
      setPreviewLabels([]);
      setPreviewLoading(false);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    void containersCrud
      .previewBoxLabels({
        existingBoxNumbers: boxNumbersExistentes,
        letter: letterEfetiva,
        count: nCaixasOrdem,
      })
      .then((r) => {
        if (cancelled) return;
        if (r.success && r.data?.labels) {
          setPreviewLabels(r.data.labels);
        } else {
          setPreviewLabels([]);
          if (r.error) toast.error(r.error);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewLabels([]);
          toast.error("Erro ao calcular etiquetas.");
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, detail?.id, letterEfetiva, nCaixasOrdem, boxNumbersKey]);

  const pesoNovas = useMemo(() => {
    if (!detail?.driverServiceOrderProducts) return 0;
    return detail.driverServiceOrderProducts.reduce((s, p) => s + (p.weight ?? 0), 0);
  }, [detail]);

  const pesoAtualContainer = useMemo(
    () => (workingContainer.boxes ?? []).reduce((s, b) => s + (b.weight ?? 0), 0),
    [workingContainer.boxes],
  );

  const volRef = VOLUME_REFERENCIA_INFORMATIVO;
  const atual = workingContainer.boxes?.length ?? 0;
  const fullW = workingContainer.fullWeight;
  const pesoTotalAposVinculo = pesoAtualContainer + pesoNovas;
  const excedePesoCheio =
    fullW != null && fullW > 0 && pesoTotalAposVinculo > fullW;
  const excedePesoJaCarregado =
    fullW != null && fullW > 0 && pesoAtualContainer > fullW;
  const excedeVolumesNoContainer = atual > volRef;
  const excedeVolumesAposVinculo = atual + nCaixasOrdem > volRef;
  const precisaLetra = !workingContainer.volumeLetter?.trim();
  const linkedOrders = workingContainer.serviceOrders ?? [];

  const linkedOverview = useMemo(() => {
    const boxes = workingContainer.boxes ?? [];
    const totalBoxes = boxes.length;
    const totalItems = boxes.reduce(
      (sum, box) =>
        sum + (box.items ?? []).reduce((s, it) => s + (it.quantity ?? 0), 0),
      0,
    );
    const totalWeight = boxes.reduce((sum, box) => sum + (box.weight ?? 0), 0);
    return {
      totalOrders: linkedOrders.length,
      totalBoxes,
      totalItems,
      totalWeight,
    };
  }, [linkedOrders.length, workingContainer.boxes]);

  const loosePhysicalBoxes = useMemo(
    () => getLoosePhysicalBoxes(workingContainer),
    [workingContainer],
  );

  const transferCandidates = useMemo(
    (): TransferBoxCandidate[] => buildTransferBoxCandidates(workingContainer, linkedOrderDetails),
    [linkedOrderDetails, workingContainer],
  );

  const excedePesoVisaoGeral =
    fullW != null && fullW > 0 && linkedOverview.totalWeight > fullW;
  const excedeVolumesVisaoGeral = linkedOverview.totalBoxes > volRef;

  const pendingUnassignOrder = useMemo(() => {
    if (!pendingUnassignOrderId) return null;
    return linkedOrders.find((o) => o.id === pendingUnassignOrderId) ?? null;
  }, [pendingUnassignOrderId, linkedOrders]);

  const pendingUnassignSenderLabel = pendingUnassignOrder
    ? serviceOrderSenderDisplayName(
        pendingUnassignOrder,
        linkedOrderDetails[pendingUnassignOrder.id],
      )
    : "";

  const confirmarUnassign = async () => {
    if (!workingContainer.id || !pendingUnassignOrderId) return;
    setUnassigning(true);
    try {
      await onUnassignServiceOrder(workingContainer.id, pendingUnassignOrderId);
      setUnassignConfirmOpen(false);
      setPendingUnassignOrderId(null);
      await loadList();
      const refreshed = await containersCrud.getById(workingContainer.id);
      if (refreshed.success && refreshed.data) {
        setWorkingContainer(refreshed.data);
        await loadLinkedOrderDetails(refreshed.data);
      }
    } finally {
      setUnassigning(false);
    }
  };

  const confirmar = async () => {
    if (!workingContainer.id || !selectedId || !detail) return;
    if (precisaLetra) {
      toast.error("Defina a letra do volume no cadastro/edição do container antes de vincular a ordem.");
      return;
    }
    const clientId = detail.appointment?.client?.id?.trim();
    const boxes = detail.driverServiceOrderProducts ?? [];
    const driverServiceOrderProductIds = boxes
      .map((p) => p.id?.trim())
      .filter((id): id is string => Boolean(id));
    if (!clientId) {
      toast.error("Cliente do agendamento não identificado. Recarregue a ordem.");
      return;
    }
    if (driverServiceOrderProductIds.length === 0 || driverServiceOrderProductIds.length !== boxes.length) {
      toast.error("Todas as linhas de produto da ordem precisam estar carregadas com id para vincular.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await containersCrud.assignServiceOrder(workingContainer.id, {
        driverServiceOrderId: selectedId,
        clientId,
        driverServiceOrderProductIds,
      });
      if (result.success && result.data) {
        await onSuccess(result.data);
        toast.success("Ordem de serviço vinculada ao container.");
        setWorkingContainer(result.data);
        onOpenChange(false);

      } else {
        toast.error(result.error ?? "Não foi possível vincular a ordem.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex h-[min(92vh,860px)] max-h-[92vh] flex-col gap-0 overflow-hidden p-0 min-h-0 w-[calc(100vw-1.5rem)] sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-1 px-6 pt-6 pb-4 border-b bg-gradient-to-br from-slate-50/90 to-background dark:from-slate-950/40">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <PackagePlus className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <DialogTitle className="text-xl leading-tight pr-8">
                Vincular ordem ao container
              </DialogTitle>
              <DialogDescription className="text-sm">
                Fluxo rápido: escolha a ordem, confira limites e confirme.
              </DialogDescription>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1">
                  <ContainerIcon className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{workingContainer.number}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-muted-foreground">
                  Numeração contínua (ex.: 11-A ou 11-AA)
                </span>
                {(workingContainer.linkedServiceOrderCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    {workingContainer.linkedServiceOrderCount} ordem(ns) já neste container
                  </span>
                )}
                {workingContainer.volumeLetter && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    Letra <span className="font-mono font-semibold">{workingContainer.volumeLetter.toUpperCase()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-5">
          <div className="space-y-6">
            <div>
              <SectionLabel step={1}>Situação deste container</SectionLabel>
              <div
                className={`grid gap-3 pl-0 sm:pl-11 grid-cols-2 ${fullW != null && fullW > 0 ? "sm:grid-cols-4" : "sm:grid-cols-3"
                  }`}
              >
                <div
                  className={cn(
                    "rounded-lg border bg-card px-3 py-2.5 min-h-[96px] grid place-items-center text-center transition-colors",
                    excedeVolumesNoContainer &&
                      "border-destructive/50 bg-destructive/5 ring-1 ring-destructive/25",
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="text-[11px] leading-tight font-medium text-muted-foreground uppercase tracking-wide">
                      Volumes já no container
                    </p>
                    <p
                      className={cn(
                        "text-xl leading-none font-semibold tabular-nums",
                        excedeVolumesNoContainer && "text-destructive",
                      )}
                    >
                      {atual}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card px-3 py-2.5 min-h-[96px] grid place-items-center text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="text-[11px] leading-tight font-medium text-muted-foreground uppercase tracking-wide">
                      Referência (volumes)
                    </p>
                    <p className="text-xl leading-none font-semibold tabular-nums">{volRef}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-lg border bg-card px-3 py-2.5 min-h-[96px] grid place-items-center text-center transition-colors",
                    excedePesoJaCarregado &&
                      "border-destructive/50 bg-destructive/5 ring-1 ring-destructive/25",
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="text-[11px] leading-tight font-medium text-muted-foreground uppercase tracking-wide">
                      Peso já carregado
                    </p>
                    <p
                      className={cn(
                        "text-lg leading-none font-semibold tabular-nums",
                        excedePesoJaCarregado && "text-destructive",
                      )}
                    >
                      {pesoAtualContainer.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg
                    </p>
                  </div>
                </div>
                {fullW != null && fullW > 0 && (
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-h-[96px] grid place-items-center text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-[11px] leading-tight font-medium text-muted-foreground uppercase tracking-wide">
                        Peso cheio (limite)
                      </p>
                      <p className="text-lg leading-none font-semibold tabular-nums">
                        {fullW.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kg
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <details className="rounded-xl border border-border/80 bg-muted/10 open:border-primary/30 open:bg-muted/20 open:shadow-sm [&[open]>summary_svg]:rotate-180">
              <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl px-2 py-3 sm:px-3 [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold text-foreground">Ordens já vinculadas</p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    O mesmo resumo está no painel lateral deste container. Abra para revisar volumes, transferir cargas ou
                    remover vínculos.
                  </p>
                </div>
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden />
              </summary>
              <div className="border-t border-border/60 px-2 pb-4 pt-4 sm:px-3">
              <div className="grid gap-3 sm:pl-11">
                {linkedDetailsLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border px-3 py-2.5 bg-muted/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando visão geral das ordens vinculadas...
                  </div>
                )}

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Visão geral consolidada</CardTitle>
                    <CardDescription>
                      Resumo de todas as ordens já vinculadas a este container.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-md border bg-background px-3 py-2 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ordens</p>
                      <p className="text-lg font-semibold tabular-nums">{linkedOverview.totalOrders}</p>
                    </div>
                    <div
                      className={cn(
                        "rounded-md border bg-background px-3 py-2 text-center transition-colors",
                        excedeVolumesVisaoGeral &&
                          "border-destructive/45 bg-destructive/5 ring-1 ring-destructive/20",
                      )}
                    >
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Volumes</p>
                      <p
                        className={cn(
                          "text-lg font-semibold tabular-nums",
                          excedeVolumesVisaoGeral && "text-destructive",
                        )}
                      >
                        {linkedOverview.totalBoxes}
                      </p>
                    </div>
                    <div className="rounded-md border bg-background px-3 py-2 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Itens</p>
                      <p className="text-lg font-semibold tabular-nums">{linkedOverview.totalItems}</p>
                    </div>
                    <div
                      className={cn(
                        "rounded-md border bg-background px-3 py-2 text-center transition-colors",
                        excedePesoVisaoGeral &&
                          "border-destructive/45 bg-destructive/5 ring-1 ring-destructive/20",
                      )}
                    >
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Peso total</p>
                      <p
                        className={cn(
                          "text-lg font-semibold tabular-nums",
                          excedePesoVisaoGeral && "text-destructive",
                        )}
                      >
                        {linkedOverview.totalWeight.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {loosePhysicalBoxes.length > 0 && (
                  <div className="rounded-lg border border-amber-500/35 bg-amber-50/50 px-3 py-2.5 space-y-2">
                    <p className="text-xs font-semibold text-amber-900/90 uppercase tracking-wide">
                      Cargas soltas neste volume
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Carga física aqui, mas a ordem continua vinculada a outro container.
                    </p>
                    <div className="space-y-2">
                      {loosePhysicalBoxes.map((box, li) => (
                        <div
                          key={box.driverServiceOrderProductId ?? `${box.boxNumber}-${li}`}
                          className="rounded-md border border-border/80 bg-background overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/20">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {box.clientName?.trim() || "Remetente (EUA)"}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-mono break-all">
                                OS #{box.driverServiceOrderId ?? "—"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{formatServiceOrderBoxLine(box)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {box.driverServiceOrderProductId && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-[10px] gap-1"
                                  onClick={() => {
                                    setTransferInitialIds([box.driverServiceOrderProductId!]);
                                    setTransferDialogOpen(true);
                                  }}
                                >
                                  <ArrowRightLeft className="h-3 w-3" />
                                  Transferir
                                </Button>
                              )}
                              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                {(box.weight ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                              </span>
                            </div>
                          </div>
                          <div className="px-3 py-2">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                              Itens neste volume
                            </p>
                            <ContainerBoxItemsList items={box.items ?? []} emptyLabel="Nenhum item listado neste volume." />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {linkedOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground rounded-lg border border-dashed px-3 py-2.5 bg-muted/30">
                    Nenhuma ordem vinculada ainda.
                  </p>
                )}
                {linkedOrders.map((order) => {
                  const detailByOrder = linkedOrderDetails[order.id];
                  const boxes = filterDriverServiceProductsOnContainer(
                    detailByOrder?.driverServiceOrderProducts,
                    workingContainer,
                  );
                  const itemCount = boxes.reduce(
                    (sum, b) =>
                      sum +
                      (b.driverServiceOrderProductsItems ?? []).reduce(
                        (s, i) => s + (i.quantity ?? 0),
                        0,
                      ),
                    0,
                  );
                  const weight = boxes.reduce((sum, b) => sum + (b.weight ?? 0), 0);
                  return (
                    <details key={order.id} className="rounded-lg border bg-card group open:border-primary/40">
                      <summary className="list-none cursor-pointer px-3 py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {serviceOrderSenderDisplayName(order, detailByOrder)}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono break-all">
                            #{order.id}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                            <span className="font-semibold text-foreground tabular-nums">{boxes.length}</span> volumes
                            <span className="mx-1.5 text-border">·</span>
                            <span className="font-semibold text-foreground tabular-nums">{itemCount}</span> itens
                            <span className="mx-1.5 text-border">·</span>
                            <span className="font-semibold text-foreground tabular-nums">
                              {weight.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                            </span>{" "}
                            kg
                          </p>
                          {(() => {
                            const cap = getServiceOrderAssociationCaption(order);
                            return cap ? (
                              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{cap}</p>
                            ) : null;
                          })()}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPendingUnassignOrderId(order.id);
                            setUnassignConfirmOpen(true);
                          }}
                        >
                          Remover
                        </Button>
                      </summary>

                      <div className="px-3 pb-3 pt-1 border-t bg-muted/20">
                        {boxes.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">
                            Nenhum volume detalhado para esta ordem.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {boxes.map((box, idx) => {
                              const boxView = mergeOrderProductWithPhysicalBox(workingContainer, box);
                              return (
                              <div
                                key={box.id ?? `${order.id}-${idx}`}
                                className="rounded-lg border border-border/80 bg-background shadow-sm overflow-hidden"
                              >
                                <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/20">
                                  <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground min-w-0">
                                    <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="font-mono tabular-nums">
                                      {getContainerBoxLabel(boxView) ?? "—"}
                                    </span>
                                    <span className="font-normal text-muted-foreground">·</span>
                                    <span className="font-normal text-muted-foreground">
                                      Tipo {formatProductTypeForDisplay(boxView.type)}
                                    </span>
                                  </p>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {box.id && (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-7 text-[10px] gap-1"
                                        onClick={() => {
                                          setTransferInitialIds([box.id!]);
                                          setTransferDialogOpen(true);
                                        }}
                                      >
                                        <ArrowRightLeft className="h-3 w-3" />
                                        Transferir
                                      </Button>
                                    )}
                                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                      {(box.weight ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                                    </span>
                                  </div>
                                </div>
                                <div className="px-3 py-2">
                                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                                    Itens neste volume
                                  </p>
                                  <ContainerBoxItemsList
                                    items={box.driverServiceOrderProductsItems ?? []}
                                    emptyLabel="Nenhum item listado neste volume."
                                  />
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
              </div>
            </details>

            <Separator />

            <div>
              <SectionLabel step={3}>Escolher ordem de serviço</SectionLabel>
              <div className="grid gap-3 sm:pl-11">
                <div className="space-y-2">
                  <Label htmlFor="aso-order" className="text-muted-foreground">
                    Ordens disponíveis (concluídas e sem container)
                  </Label>
                  <Select
                    value={selectedId || "__none__"}
                    onValueChange={(v) => setSelectedId(v === "__none__" ? "" : v)}
                    disabled={loadingList}
                  >
                    <SelectTrigger id="aso-order" className="h-11 w-full rounded-lg border-border/80 bg-background">
                      <SelectValue
                        placeholder={loadingList ? "Carregando ordens…" : "Selecione uma ordem"}
                      />
                    </SelectTrigger>
                    <SelectContent className="max-w-[min(100vw-1.5rem,28rem)]">
                      <SelectItem value="__none__">Nenhuma selecionada</SelectItem>
                      {orders.map((o) =>
                        o.id ? (
                          <SelectItem key={o.id} value={o.id}>
                            {labelOrdem(o)}
                          </SelectItem>
                        ) : null,
                      )}
                    </SelectContent>
                  </Select>
                  {orders.length === 0 && !loadingList && (
                    <p className="text-sm text-muted-foreground rounded-lg border border-dashed px-3 py-2.5 bg-muted/30">
                      Nenhuma ordem disponível agora.
                    </p>
                  )}
                </div>

                {loadingList && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando ordens…
                  </div>
                )}
              </div>
            </div>

            <Separator />
            <div>
              <SectionLabel step={4}>Escolher atendente responsável</SectionLabel>
              <div className="sm:pl-11 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="space-y-2 w-full">
                  <AtendenteSelect
                    user={user ? { id: user.id, nome: user.nome } : null}
                    value={selectedAtendente}
                    onValueChange={(id) => setSelectedAtendente(id)}
                    label="Atendente *"
                    required
                  />
                </div>
              </div>
            </div>

            {!precisaLetra && (
              <>
                <Separator />
                <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-center gap-2 text-sm sm:pl-11">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    Letra do volume deste container:{" "}
                    <strong className="font-mono text-base">{workingContainer.volumeLetter?.toUpperCase()}</strong>
                  </span>
                </div>
              </>
            )}

            {precisaLetra && (
              <>
                <Separator />
                <div className="rounded-lg border border-amber-500/35 bg-amber-50/60 px-4 py-3 text-sm sm:pl-11">
                  Defina a letra do volume no diálogo de edição do container para habilitar o vínculo de ordens.
                </div>
              </>
            )}

            {loadingDetail && selectedId && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Carregando volumes e itens da ordem…</p>
              </div>
            )}

            {detail && !loadingDetail && (
              <>
                <Separator />
                <div>
                  <SectionLabel step={4}>Conferência e limites</SectionLabel>
                  <Card className="border-primary/20 bg-primary/5 sm:ml-11">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Após vincular
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        Volumes e peso após vincular são informativos: ficam em vermelho ao passar da referência de{" "}
                        {volRef} volumes ou do peso cheio cadastrado (sem bloqueio no servidor).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 pb-4">
                      <div
                        className={cn(
                          "rounded-md border px-4 py-2.5 min-w-[200px] transition-colors",
                          excedeVolumesAposVinculo
                            ? "border-destructive/50 bg-destructive/8 shadow-sm ring-2 ring-destructive/25"
                            : "bg-background border-border",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase">Volumes (carga)</p>
                          {excedeVolumesAposVinculo && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              Acima
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-lg font-semibold tabular-nums leading-tight",
                            excedeVolumesAposVinculo && "text-destructive",
                          )}
                        >
                          {atual} + {nCaixasOrdem} = {atual + nCaixasOrdem} / {volRef}
                        </p>
                      </div>
                      {fullW != null && fullW > 0 && (
                        <div
                          className={cn(
                            "rounded-md border px-4 py-2.5 min-w-[200px] transition-colors",
                            excedePesoCheio
                              ? "border-destructive/50 bg-destructive/8 shadow-sm ring-2 ring-destructive/25"
                              : "bg-background border-border",
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase">Peso total</p>
                            {excedePesoCheio && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                Acima
                              </span>
                            )}
                          </div>
                          <p
                            className={cn(
                              "text-lg font-semibold tabular-nums leading-tight",
                              excedePesoCheio && "text-destructive",
                            )}
                          >
                            {pesoTotalAposVinculo.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} /{" "}
                            {fullW.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <ServiceOrderBoxesPreview
                      order={detail}
                      previewLabels={previewLabels}
                      previewLoading={previewLoading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col-reverse sm:flex-row gap-2 px-6 py-4 border-t bg-muted/30">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto min-w-[160px]"
            onClick={() => void confirmar()}
            disabled={submitting || !selectedId || !detail || loadingDetail}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vinculando…
              </>
            ) : (
              "Confirmar vínculo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <UnassignContainerOrderConfirmDialog
      open={unassignConfirmOpen}
      onOpenChange={(o) => {
        setUnassignConfirmOpen(o);
        if (!o) setPendingUnassignOrderId(null);
      }}
      senderLabel={pendingUnassignSenderLabel}
      orderId={pendingUnassignOrderId ?? ""}
      containerNumber={workingContainer.number}
      confirming={unassigning}
      onConfirm={confirmarUnassign}
    />

    <ContainerTransferBoxesDialog
      open={transferDialogOpen}
      onOpenChange={setTransferDialogOpen}
      sourceContainer={workingContainer}
      allContainers={allContainers}
      candidates={transferCandidates}
      initialSelectedIds={transferInitialIds}
      onCompleted={async ({ source, target }) => {
        await onTransferCompleted({ source, target });
        const idToRefresh = workingContainer.id ?? source.id;
        if (!idToRefresh) return;
        const r = await containersCrud.getById(idToRefresh);
        if (r.success && r.data) {
          setWorkingContainer(r.data);
          await loadLinkedOrderDetails(r.data);
        }
      }}
    />
    </>
  );
}
