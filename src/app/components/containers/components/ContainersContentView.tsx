import React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Container } from "../../../api";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Container as ContainerIcon,
  MapPin,
  Package,
  Ship,
  X,
} from "lucide-react";

type ViewMode = "grid" | "list" | "kanban";

type Props = {
  viewMode: ViewMode;
  filteredContainers: Container[];
  containersByStatus: {
    preparacao: Container[];
    transito: Container[];
    entregue: Container[];
    cancelado: Container[];
  };
  setSelectedContainer: (container: Container) => void;
  getStatusColor: (status: string) => { bg: string; border: string; text: string; badge: string };
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>;
  getStatusLabel: (status: string) => string;
  formatDateOnlyForDisplay: (value: string | undefined | null, kind: "short" | "medium" | "long") => string;
};

export function ContainersContentView({
  viewMode,
  filteredContainers,
  containersByStatus,
  setSelectedContainer,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  formatDateOnlyForDisplay,
}: Props) {
  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredContainers.map((container) => {
            const colors = getStatusColor(container.status);
            const StatusIcon = getStatusIcon(container.status);
            return (
              <motion.div key={container.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                <Card className={`hover:shadow-xl transition-all cursor-pointer border-l-4 ${colors.border} ${colors.bg} group`} onClick={() => setSelectedContainer(container)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${colors.bg}`}>
                          <StatusIcon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{container.number} - Lacre: {container.seal || "—"}</CardTitle>
                          <Badge className={colors.badge}>{getStatusLabel(container.status)}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <div className="inline-flex items-center gap-1 min-w-0">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-medium break-words">{container.origin}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="inline-flex items-center gap-1 min-w-0">
                        <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="font-medium break-words">{container.destination}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Embarque</p>
                        <p className="font-semibold">{formatDateOnlyForDisplay(container.boardingDate, "short")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Previsão</p>
                        <p className="font-semibold">{formatDateOnlyForDisplay(container.estimatedArrival, "short")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredContainers.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <ContainerIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum container encontrado</p>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Containers</CardTitle>
          <CardDescription>{filteredContainers.length} container(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredContainers.map((container) => {
                const colors = getStatusColor(container.status);
                const StatusIcon = getStatusIcon(container.status);
                return (
                  <motion.div key={container.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="group">
                    <Card className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${colors.border}`} onClick={() => setSelectedContainer(container)}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-full ${colors.bg}`}>
                              <StatusIcon className={`w-6 h-6 ${colors.text}`} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-base sm:text-lg break-words">{container.number}</h3>
                                <Badge className={colors.badge}>{getStatusLabel(container.status)}</Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">Rota</p>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <div className="inline-flex items-center gap-1 min-w-0">
                                      <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                                      <span className="font-medium break-words">{container.origin || "—"}</span>
                                    </div>
                                    <ArrowRight className="w-3 h-3 shrink-0" />
                                    <div className="inline-flex items-center gap-1 min-w-0">
                                      <MapPin className="w-3 h-3 text-green-600 shrink-0" />
                                      <span className="font-medium break-words">{container.destination || "—"}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">Embarque</p>
                                  <p className="font-semibold">{formatDateOnlyForDisplay(container.boardingDate, "medium")}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">Previsão</p>
                                  <p className="font-semibold">{formatDateOnlyForDisplay(container.estimatedArrival, "medium")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredContainers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ContainerIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum container encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-yellow-600" />
            Em Preparação
            <Badge className="bg-yellow-200 text-yellow-800 ml-auto">{containersByStatus.preparacao.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {containersByStatus.preparacao.map((container) => (
            <Card key={container.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedContainer(container)}>
              <CardContent className="p-3 space-y-2">
                <h4 className="font-semibold text-sm">{container.number}</h4>
                <div className="text-xs text-muted-foreground">
                  <p>{container.origin || "—"} → {container.destination || "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Ship className="w-4 h-4 text-blue-600" />
            Em Trânsito
            <Badge className="bg-blue-200 text-blue-800 ml-auto">{containersByStatus.transito.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {containersByStatus.transito.map((container) => (
            <Card key={container.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedContainer(container)}>
              <CardContent className="p-3 space-y-2">
                <h4 className="font-semibold text-sm">{container.number}</h4>
                <div className="text-xs text-muted-foreground">
                  <p>{container.origin || "—"} → {container.destination || "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Entregue
            <Badge className="bg-green-200 text-green-800 ml-auto">{containersByStatus.entregue.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {containersByStatus.entregue.map((container) => (
            <Card key={container.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedContainer(container)}>
              <CardContent className="p-3 space-y-2">
                <h4 className="font-semibold text-sm">{container.number}</h4>
                <div className="text-xs text-muted-foreground">
                  <p>{container.origin || "—"} → {container.destination || "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <X className="w-4 h-4 text-red-600" />
            Cancelado
            <Badge className="bg-red-200 text-red-800 ml-auto">{containersByStatus.cancelado.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {containersByStatus.cancelado.map((container) => (
            <Card key={container.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedContainer(container)}>
              <CardContent className="p-3 space-y-2">
                <h4 className="font-semibold text-sm">{container.number}</h4>
                <div className="text-xs text-muted-foreground">
                  <p>{container.origin} → {container.destination}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

