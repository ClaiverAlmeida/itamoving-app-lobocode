import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Container } from "../../../api";
import { serviceOrderFormService } from "../../../api";
import type { DriverServiceOrderView } from "../../../api/services/driver-service-order/service-order-form.service";
import { VOLUME_REFERENCIA_INFORMATIVO } from "../containers.constants";
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
import { ContainerBoxItemsList } from "./ContainerBoxItemsList";
import { ContainerAssignServiceOrderCard } from "./ContainerAssignServiceOrderCard";
import {
  ContainerTransferBoxesDialog,
  type TransferBoxCandidate,
} from "./ContainerTransferBoxesDialog";
import { UnassignContainerOrderConfirmDialog } from "./UnassignContainerOrderConfirmDialog";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { cn } from "../../ui/utils";
import { StatusSelect } from "../../forms";
import {
  Anchor,
  ArrowRight,
  ArrowUpRight,
  ArrowRightLeft,
  CheckCircle2,
  Container as ContainerIcon,
  Edit,
  FileText,
  Gauge,
  Globe,
  MapPin,
  Navigation,
  AlertTriangle,
  Loader2,
  Package,
  Ship,
  Trash2,
  Truck,
  Weight,
  X,
} from "lucide-react";

type ContainerEvento = {
  id: string;
  tipo: "preparacao" | "embarque" | "transito" | "alfandega" | "entrega";
  descricao: string;
  local: string;
  data: Date;
  concluido: boolean;
};

type Props = {
  selectedContainer: Container | null;
  setSelectedContainer: (container: Container | null) => void;
  getStatusColor: (status: string) => { badge: string };
  getStatusLabel: (status: string) => string;
  formatDateOnlyForDisplay: (value: string | undefined | null, kind: "short" | "medium" | "long") => string;
  getContainerEventos: (containerId: string) => ContainerEvento[];
  fillFormFromContainer: (container: Container, toDateOnlyForInput: (value: string | null | undefined) => string) => void;
  toDateOnlyForInput: (value: string | undefined | null) => string;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleContainerStatusChange: (id: string, status: Container["status"]) => void | Promise<void>;
  statusItems: readonly { value: Container["status"]; label: string }[];
  onContainerVolumesUpdated: (updated: Container) => void | Promise<void>;
  onUnassignServiceOrder: (containerId: string, driverServiceOrderId: string) => void | Promise<void>;
  /** Lista completa de containers (mesma empresa) para escolher destino na transferência de caixas. */
  allContainers: Container[];
  onTransferCompleted: (payload: { source: Container; target: Container }) => void | Promise<void>;
};

const getEventoIcon = (tipo: ContainerEvento["tipo"]) => {
  switch (tipo) {
    case "preparacao":
      return Package;
    case "embarque":
      return Anchor;
    case "transito":
      return Ship;
    case "alfandega":
      return FileText;
    case "entrega":
      return Truck;
  }
};

export function ContainersSidePanel(props: Props) {
  const {
    selectedContainer,
    setSelectedContainer,
    getStatusColor,
    getStatusLabel,
    formatDateOnlyForDisplay,
    getContainerEventos,
    fillFormFromContainer,
    toDateOnlyForInput,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    handleContainerStatusChange,
    statusItems,
    onContainerVolumesUpdated,
    onUnassignServiceOrder,
    allContainers,
    onTransferCompleted,
  } = props;
  const [linkedDetailsLoading, setLinkedDetailsLoading] = useState(false);
  const [linkedOrderDetails, setLinkedOrderDetails] = useState<Record<string, DriverServiceOrderView>>({});
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferInitialIds, setTransferInitialIds] = useState<string[] | undefined>(undefined);
  const [unassignConfirmOpen, setUnassignConfirmOpen] = useState(false);
  const [pendingUnassignOrderId, setPendingUnassignOrderId] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState(false);

  const containerSyncKey = useMemo(() => {
    const c = selectedContainer;
    if (!c?.id) return "";
    const orderSig = (c.serviceOrders ?? [])
      .map((o) => o.id)
      .sort()
      .join(",");
    const boxSig = (c.boxes ?? [])
      .map((b) =>
        [b.driverServiceOrderProductId ?? "", b.boxNumber, b.orderPrimaryContainerId ?? ""].join(":"),
      )
      .sort()
      .join("|");
    return `${c.id}|${orderSig}|${boxSig}|${String(c.volumeCapacity ?? "")}|${String(c.totalWeight ?? "")}`;
  }, [selectedContainer]);

  useEffect(() => {
    if (!selectedContainer) {
      setLinkedOrderDetails({});
      return;
    }
    const orderIds = linkedDriverServiceOrderIdsToFetch(selectedContainer);
    if (orderIds.length === 0) {
      setLinkedOrderDetails({});
      return;
    }
    let cancelled = false;
    setLinkedDetailsLoading(true);
    void Promise.all(
      orderIds.map(async (id) => {
        const r = await serviceOrderFormService.getById(id);
        return { id, data: r.success ? r.data : null };
      }),
    ).then((rows) => {
      if (cancelled) return;
      const next: Record<string, DriverServiceOrderView> = {};
      for (const row of rows) {
        if (row.data) next[row.id] = row.data;
      }
      setLinkedOrderDetails(next);
      setLinkedDetailsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [containerSyncKey]);

  const linkedOverview = useMemo(() => {
    const boxes = selectedContainer?.boxes ?? [];
    const totalBoxes = boxes.length;
    const totalItems = boxes.reduce(
      (sum, box) => sum + (box.items ?? []).reduce((s, it) => s + (it.quantity ?? 0), 0),
      0,
    );
    return { totalBoxes, totalItems };
  }, [selectedContainer?.boxes]);

  const transferCandidates = useMemo(
    (): TransferBoxCandidate[] => buildTransferBoxCandidates(selectedContainer, linkedOrderDetails),
    [selectedContainer, linkedOrderDetails],
  );

  const loosePhysicalBoxes = useMemo(
    () => getLoosePhysicalBoxes(selectedContainer),
    [selectedContainer],
  );

  const pendingUnassignOrder = useMemo(() => {
    if (!pendingUnassignOrderId || !selectedContainer) return null;
    return (selectedContainer.serviceOrders ?? []).find((o) => o.id === pendingUnassignOrderId) ?? null;
  }, [pendingUnassignOrderId, selectedContainer]);

  const pendingUnassignSenderLabel = pendingUnassignOrder
    ? serviceOrderSenderDisplayName(pendingUnassignOrder, linkedOrderDetails[pendingUnassignOrder.id])
    : "";

  const confirmarUnassign = useCallback(async () => {
    if (!selectedContainer?.id || !pendingUnassignOrderId) return;
    setUnassigning(true);
    try {
      await onUnassignServiceOrder(selectedContainer.id, pendingUnassignOrderId);
      setUnassignConfirmOpen(false);
      setPendingUnassignOrderId(null);
    } finally {
      setUnassigning(false);
    }
  }, [onUnassignServiceOrder, pendingUnassignOrderId, selectedContainer?.id]);

  const pesoLimite = selectedContainer?.fullWeight ?? null;
  const pesoCarga = selectedContainer?.totalWeight ?? 0;
  const pesoPercent =
    pesoLimite != null && pesoLimite > 0 ? (pesoCarga / pesoLimite) * 100 : 0;
  const excedePesoCheio =
    pesoLimite != null && pesoLimite > 0 && pesoCarga > pesoLimite;

  const volRef = VOLUME_REFERENCIA_INFORMATIVO;
  const nCaixasContainer = selectedContainer?.boxes?.length ?? 0;
  const excedeVolumesReferencia = nCaixasContainer > volRef;
  const volumesPercent = volRef > 0 ? (nCaixasContainer / volRef) * 100 : 0;

  return (
    <AnimatePresence>
      {selectedContainer && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed inset-y-0 right-0 w-full lg:w-[700px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-border p-4 sm:p-5 lg:p-6 z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                  <div className="bg-blue-500 p-3 lg:p-4 rounded-full flex-shrink-0">
                    <ContainerIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-foreground mb-2 break-words">
                      {selectedContainer.number}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        Lacre: {selectedContainer.seal || "—"}
                      </Badge>
                    </div>
                      <Badge className={getStatusColor(selectedContainer.status).badge}>
                        {getStatusLabel(selectedContainer.status)}
                      </Badge>
                      {String(selectedContainer.volumeLetter ?? "").trim() !== "" && (
                        <Badge variant="secondary">
                          Volume {String(selectedContainer.volumeLetter).trim().toUpperCase()}
                        </Badge>
                      )}
                      <Badge variant="outline">{selectedContainer.boxes?.length || 0} volumes</Badge>
                      <Badge variant="outline">{selectedContainer.totalWeight || 0} kg</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContainer(null)} className="flex-shrink-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fillFormFromContainer(selectedContainer, toDateOnlyForInput);
                    setIsEditDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-muted-foreground" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusSelect
                  value={selectedContainer.status}
                  items={statusItems}
                  onValueChange={(value) => {
                    handleContainerStatusChange(selectedContainer.id!, value);
                    setSelectedContainer({ ...selectedContainer, status: value });
                  }}
                  triggerClassName="w-full"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Rota Internacional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Origem</span>
                    </div>
                    <p className="font-semibold break-words">{selectedContainer.origin}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground self-center" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Destino</span>
                    </div>
                    <p className="font-semibold break-words">{selectedContainer.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data de Embarque</p>
                    <p className="font-semibold">{formatDateOnlyForDisplay(selectedContainer.boardingDate, "long")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Previsão de Chegada</p>
                    <p className="font-semibold">{formatDateOnlyForDisplay(selectedContainer.estimatedArrival, "long")}</p>
                  </div>
                </div>

                {selectedContainer.trackingLink && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Link de Rastreamento</p>
                    <a
                      href={selectedContainer.trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Rastrear Container
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getContainerEventos(selectedContainer.id ?? "").map((evento, index) => {
                    const Icon = getEventoIcon(evento.tipo);
                    const isLast = index === getContainerEventos(selectedContainer.id ?? "").length - 1;
                    return (
                      <div key={evento.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-full ${evento.concluido ? "bg-green-100" : "bg-slate-100"}`}>
                            <Icon className={`w-4 h-4 ${evento.concluido ? "text-green-600" : "text-slate-400"}`} />
                          </div>
                          {!isLast && <div className={`w-0.5 flex-1 min-h-[40px] ${evento.concluido ? "bg-green-200" : "bg-slate-200"}`} />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${evento.concluido ? "text-foreground" : "text-muted-foreground"}`}>{evento.descricao}</h4>
                            {evento.concluido && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {evento.local}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(evento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Weight className="w-5 h-5" />
                  Capacidade e Peso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={cn(
                    "space-y-2 rounded-lg border p-3 transition-colors",
                    excedePesoCheio
                      ? "border-destructive/50 bg-destructive/5 shadow-sm ring-1 ring-destructive/20"
                      : "border-transparent",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Peso da carga</span>
                    {excedePesoCheio && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Acima do peso cheio
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Atual / limite</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums text-base",
                        excedePesoCheio && "text-destructive",
                      )}
                    >
                      {pesoCarga.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} /{" "}
                      {pesoLimite != null ? pesoLimite.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—"}{" "}
                      kg
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, pesoPercent)}
                    variant={excedePesoCheio ? "destructive" : "default"}
                    className="h-3"
                  />
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      excedePesoCheio ? "font-medium text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {pesoLimite != null && pesoLimite > 0
                      ? `${pesoPercent.toFixed(1)}% do limite (peso cheio)${
                          excedePesoCheio ? " — acima do cadastrado." : ""
                        }`
                      : "Defina o peso cheio do container para usar o limite."}
                  </p>
                </div>

                <div
                  className={cn(
                    "space-y-2 rounded-lg border p-3 transition-colors",
                    excedeVolumesReferencia
                      ? "border-destructive/50 bg-destructive/5 shadow-sm ring-1 ring-destructive/20"
                      : "border-transparent",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Volumes no container</span>
                    {excedeVolumesReferencia && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Acima da referência
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Atual / referência</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums text-base",
                        excedeVolumesReferencia && "text-destructive",
                      )}
                    >
                      {nCaixasContainer} / {volRef}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, volumesPercent)}
                    variant={excedeVolumesReferencia ? "destructive" : "default"}
                    className="h-3"
                  />
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      excedeVolumesReferencia ? "font-medium text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {volumesPercent.toFixed(1)}% da referência de {volRef} volumes
                    {excedeVolumesReferencia ? " — acima da referência." : "."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Volume</p>
                    <p className="font-semibold">{selectedContainer.volume} m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                    <p className="font-semibold">{selectedContainer.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Peso vazio (tara)</p>
                    <p className="font-semibold">
                      {selectedContainer.emptyWeight != null
                        ? `${selectedContainer.emptyWeight.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Peso cheio (bruto)</p>
                    <p className="font-semibold">
                      {selectedContainer.fullWeight != null
                        ? `${selectedContainer.fullWeight.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Ordens vinculadas
                    </CardTitle>
                    <CardDescription>
                      {selectedContainer.serviceOrders?.length ?? 0} ordem(ns) associada(s) a este container.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    disabled={transferCandidates.length === 0 || linkedDetailsLoading}
                    onClick={() => {
                      setTransferInitialIds(undefined);
                      setTransferDialogOpen(true);
                    }}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Transferir volumes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {linkedDetailsLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-md border px-3 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Carregando detalhes...
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Volumes</p>
                    <p className="text-lg font-semibold tabular-nums leading-tight">{linkedOverview.totalBoxes}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Itens</p>
                    <p className="text-lg font-semibold tabular-nums leading-tight">{linkedOverview.totalItems}</p>
                  </div>
                </div>
                {loosePhysicalBoxes.length > 0 && (
                  <div className="rounded-lg border border-amber-500/35 bg-amber-50/50 px-3 py-2.5 space-y-2">
                    <p className="text-xs font-semibold text-amber-900/90 uppercase tracking-wide">
                      Cargas soltas neste volume
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Carga física aqui, mas a ordem continua vinculada a outro container. Itens conforme o servidor.
                    </p>
                    <div className="space-y-2">
                      {loosePhysicalBoxes.map((box, li) => (
                        <div
                          key={box.driverServiceOrderProductId ?? `${box.boxNumber}-${li}`}
                          className="rounded-md border border-border/80 bg-background overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2 px-2.5 py-2 border-b border-border/50 bg-muted/15">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {box.clientName?.trim() || "Remetente (EUA)"}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-mono break-all">
                                OS #{box.driverServiceOrderId ?? "—"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {formatServiceOrderBoxLine(box)}
                              </p>
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
                              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                                {(box.weight ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                              </span>
                            </div>
                          </div>
                          <div className="px-2.5 py-2">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                              Itens neste volume
                            </p>
                            <ContainerBoxItemsList
                              items={box.items ?? []}
                              compact
                              emptyLabel="Nenhum item listado."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(selectedContainer.serviceOrders ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                    Nenhuma ordem vinculada no momento.
                  </p>
                )}
                {(selectedContainer.serviceOrders ?? []).map((order) => {
                  const detailByOrder = linkedOrderDetails[order.id];
                  const boxes = filterDriverServiceProductsOnContainer(
                    detailByOrder?.driverServiceOrderProducts,
                    selectedContainer,
                  );
                  const itemCount = boxes.reduce(
                    (sum, b) =>
                      sum +
                      (b.driverServiceOrderProductsItems ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0),
                    0,
                  );
                  const orderWeight = boxes.reduce((sum, b) => sum + (b.weight ?? 0), 0);
                  return (
                    <details key={order.id} className="rounded-lg border border-border/80 bg-card shadow-sm group open:border-primary/30">
                      <summary className="list-none px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer">
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
                              {orderWeight.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
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
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!selectedContainer.id) return;
                            setPendingUnassignOrderId(order.id);
                            setUnassignConfirmOpen(true);
                          }}
                        >
                          Remover
                        </Button>
                      </summary>
                      <div className="px-3 pb-3 pt-2 border-t bg-muted/20 space-y-2">
                        {boxes.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sem volumes detalhados.</p>
                        ) : (
                          boxes.map((box, idx) => {
                            const boxView = mergeOrderProductWithPhysicalBox(selectedContainer, box);
                            return (
                            <div
                              key={box.id ?? `${order.id}-${idx}`}
                              className="rounded-lg border border-border/70 bg-background overflow-hidden"
                            >
                                <div className="flex items-start justify-between gap-2 px-2.5 py-2 border-b border-border/50 bg-muted/15">
                                <p className="text-xs font-semibold text-foreground leading-snug min-w-0">
                                  <span className="font-mono tabular-nums">
                                    {getContainerBoxLabel(boxView) ?? "—"}
                                  </span>
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    · Tipo {formatProductTypeForDisplay(boxView.type)}
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
                                  <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                                    {(box.weight ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                                  </span>
                                </div>
                              </div>
                              <div className="px-2.5 py-2">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                                  Itens neste volume
                                </p>
                                <ContainerBoxItemsList
                                  items={box.driverServiceOrderProductsItems ?? []}
                                  compact
                                  emptyLabel="Nenhum item listado."
                                />
                              </div>
                            </div>
                            );
                          })
                        )}
                      </div>
                    </details>
                  );
                })}
              </CardContent>
            </Card>

            <ContainerAssignServiceOrderCard
              container={selectedContainer}
              allContainers={allContainers}
              onTransferCompleted={onTransferCompleted}
              onAssigned={onContainerVolumesUpdated}
              onUnassignServiceOrder={onUnassignServiceOrder}
            />
          </div>

          {selectedContainer && (
            <ContainerTransferBoxesDialog
              open={transferDialogOpen}
              onOpenChange={setTransferDialogOpen}
              sourceContainer={selectedContainer}
              allContainers={allContainers}
              candidates={transferCandidates}
              initialSelectedIds={transferInitialIds}
              onCompleted={onTransferCompleted}
            />
          )}

          {selectedContainer && (
            <UnassignContainerOrderConfirmDialog
              open={unassignConfirmOpen}
              onOpenChange={(o) => {
                setUnassignConfirmOpen(o);
                if (!o) setPendingUnassignOrderId(null);
              }}
              senderLabel={pendingUnassignSenderLabel}
              orderId={pendingUnassignOrderId ?? ""}
              containerNumber={selectedContainer.number}
              confirming={unassigning}
              onConfirm={confirmarUnassign}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

