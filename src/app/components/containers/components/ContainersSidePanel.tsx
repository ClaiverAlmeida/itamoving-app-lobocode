import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Container } from "../../../api";
import { serviceOrderFormService } from "../../../api";
import type { DriverServiceOrderView } from "../../../api/services/driver-service-order/service-order-form.service";
import { ContainerAssignServiceOrderCard } from "./ContainerAssignServiceOrderCard";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { StatusSelect } from "../../forms";
import {
  Anchor,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Container as ContainerIcon,
  Edit,
  FileText,
  Gauge,
  Globe,
  MapPin,
  Navigation,
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
  } = props;
  const [linkedDetailsLoading, setLinkedDetailsLoading] = useState(false);
  const [linkedOrderDetails, setLinkedOrderDetails] = useState<Record<string, DriverServiceOrderView>>({});

  useEffect(() => {
    if (!selectedContainer) {
      setLinkedOrderDetails({});
      return;
    }
    const linked = selectedContainer.serviceOrders ?? [];
    if (linked.length === 0) {
      setLinkedOrderDetails({});
      return;
    }
    let cancelled = false;
    setLinkedDetailsLoading(true);
    void Promise.all(
      linked.map(async (o) => {
        const r = await serviceOrderFormService.getById(o.id);
        return { id: o.id, data: r.success ? r.data : null };
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
  }, [selectedContainer?.id, selectedContainer?.serviceOrders]);

  const linkedOverview = useMemo(() => {
    const details = Object.values(linkedOrderDetails);
    const boxes = details.flatMap((o) => o.driverServiceOrderProducts ?? []);
    const totalBoxes = boxes.length;
    const totalItems = boxes.reduce(
      (sum, box) =>
        sum + (box.driverServiceOrderProductsItems ?? []).reduce((s, it) => s + (it.quantity ?? 0), 0),
      0,
    );
    return { totalBoxes, totalItems };
  }, [linkedOrderDetails]);

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
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="text-xs">
                        Lacre: {selectedContainer.seal || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedContainer.status).badge}>
                        {getStatusLabel(selectedContainer.status)}
                      </Badge>
                      {selectedContainer.volumeLetter &&
                        (selectedContainer.boxes?.length ?? 0) > 0 && (
                        <Badge variant="secondary">Volume {selectedContainer.volumeLetter.toUpperCase()}</Badge>
                      )}
                      <Badge variant="outline">{selectedContainer.boxes?.length || 0} caixas</Badge>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peso da carga</span>
                    <span className="font-semibold">
                      {selectedContainer.totalWeight} /{" "}
                      {selectedContainer.fullWeight != null ? selectedContainer.fullWeight : "—"} kg
                    </span>
                  </div>
                  <Progress
                    value={
                      selectedContainer.fullWeight != null && selectedContainer.fullWeight > 0
                        ? ((selectedContainer.totalWeight ?? 0) / selectedContainer.fullWeight) * 100
                        : 0
                    }
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedContainer.fullWeight != null && selectedContainer.fullWeight > 0
                      ? `${(((selectedContainer.totalWeight ?? 0) / selectedContainer.fullWeight) * 100).toFixed(1)}% do limite (peso cheio)`
                      : "Defina o peso cheio do container para usar o limite."}
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Ordens vinculadas
                </CardTitle>
                <CardDescription>
                  {selectedContainer.serviceOrders?.length ?? 0} ordem(ns) associada(s) a este container.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {linkedDetailsLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-md border px-3 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Carregando detalhes...
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{linkedOverview.totalBoxes} caixas</Badge>
                  <Badge variant="outline">{linkedOverview.totalItems} itens</Badge>
                </div>
                {(selectedContainer.serviceOrders ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                    Nenhuma ordem vinculada no momento.
                  </p>
                )}
                {(selectedContainer.serviceOrders ?? []).map((order) => {
                  const detailByOrder = linkedOrderDetails[order.id];
                  const boxes = detailByOrder?.driverServiceOrderProducts ?? [];
                  return (
                    <details key={order.id} className="rounded-md border bg-card">
                      <summary className="list-none px-3 py-2 flex items-center justify-between gap-2 cursor-pointer">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {order.recipientName?.trim() || "Cliente USA"}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono break-all">
                            #{order.id}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-[10px]">{boxes.length} caixas</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!selectedContainer.id) return;
                            void onUnassignServiceOrder(selectedContainer.id, order.id);
                          }}
                        >
                          Remover
                        </Button>
                      </summary>
                      <div className="px-3 pb-3 pt-1 border-t bg-muted/20 space-y-2">
                        {boxes.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sem caixas detalhadas.</p>
                        ) : (
                          boxes.map((box, idx) => (
                            <div key={box.id ?? `${order.id}-${idx}`} className="rounded border bg-background px-2 py-1.5">
                              <p className="text-xs font-medium">
                                Caixa #{box.number || idx + 1} - {box.type || "N/A"}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  );
                })}
              </CardContent>
            </Card>

            <ContainerAssignServiceOrderCard
              container={selectedContainer}
              onAssigned={onContainerVolumesUpdated}
              onUnassignServiceOrder={onUnassignServiceOrder}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

