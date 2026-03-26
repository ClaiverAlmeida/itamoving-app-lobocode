import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Container } from "../../../api";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { StatusSelect } from "../../forms";
import {
  Anchor,
  ArrowRight,
  ArrowUpRight,
  Box,
  CheckCircle2,
  Container as ContainerIcon,
  Edit,
  FileText,
  Gauge,
  Globe,
  MapPin,
  Navigation,
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
  } = props;

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
                    <span className="text-sm text-muted-foreground">Peso Utilizado</span>
                    <span className="font-semibold">
                      {selectedContainer.totalWeight} / {selectedContainer.weightLimit} kg
                    </span>
                  </div>
                  <Progress value={((selectedContainer.totalWeight ?? 0) / (selectedContainer.weightLimit || 1)) * 100} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {(((selectedContainer.totalWeight ?? 0) / (selectedContainer.weightLimit || 1)) * 100).toFixed(1)}% da capacidade máxima
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent />
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

