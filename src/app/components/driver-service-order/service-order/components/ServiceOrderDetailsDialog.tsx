import React from "react";
import { Clock, DollarSign } from "lucide-react";
import { Badge } from "../../../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { cn } from "../../../ui/utils";
import type { DriverServiceOrderView } from "../../../../api";
import { STATUS_LABEL } from "../service-order.constants";
import { formatDateTime, formatUsd, statusBadgeClass } from "../service-order.utils";
import { AgendamentoTabContent, CaixasTabContent, ClienteTabContent, DestinoTabContent, ResumoTabContent } from "./tabs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewOrdem: DriverServiceOrderView | null;
  onOpenRecibo: (ordem: DriverServiceOrderView) => void;
};

export function ServiceOrderDetailsDialog({ open, onOpenChange, viewOrdem, onOpenRecibo }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-x-auto overflow-y-hidden rounded-xl border border-border/80 p-0 shadow-lg",
          "h-[min(85dvh,100svh)] max-h-[min(85dvh,680px)] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)]",
          "sm:h-[min(72vh,600px)] sm:max-h-[min(72vh,600px)] sm:w-[min(92vw,56rem)] sm:max-w-none sm:!max-w-[min(56rem,calc(100vw-2rem))] lg:!max-w-[min(60rem,calc(100vw-3rem))]",
        )}
      >
        {viewOrdem ? (
          <>
            <DialogHeader className="shrink-0 space-y-0 border-b border-border/80 bg-gradient-to-br from-[#1E3A5F]/[0.07] via-background to-background px-4 py-4 pr-12 text-left sm:px-6 sm:py-5 sm:pr-14">
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-xl font-semibold tracking-tight text-[#1E3A5F] sm:text-2xl">Ordem de serviço</DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-foreground/90">#{viewOrdem.id}</span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 rounded-md text-xs text-muted-foreground">
                    <span>Data de Criação: {formatDateTime(viewOrdem.createdAt ?? "—")}</span>
                    <span>Data de Edição: {formatDateTime(viewOrdem.updatedAt ?? "—")}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Badge variant="outline" className={`border font-medium ${statusBadgeClass(viewOrdem.status)}`}>
                    <Clock className="mr-1 h-3 w-3 opacity-80" />
                    {STATUS_LABEL[viewOrdem.status]}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs font-normal tabular-nums">
                    <DollarSign className="mr-1 h-3 w-3" />
                    {formatUsd(viewOrdem.chargedValue ?? 0)}
                  </Badge>
                </div>
              </div>
              <DialogDescription className="pt-3 text-sm text-muted-foreground">
                Consulta rápida: resumo operacional, contatos, agendamento e conteúdo das caixas.
              </DialogDescription>
            </DialogHeader>

            <div className={cn("min-h-0 flex-1 overflow-auto px-3 pb-4 pt-0 sm:px-6", "max-h-[calc(min(85dvh,680px)-9rem)] sm:max-h-[calc(min(72vh,600px)-10.5rem)]")}>
              {(() => {
                const o = viewOrdem;
                const nCaixas = o.driverServiceOrderProducts?.length ?? 0;
                return (
                  <Tabs defaultValue="resumo" className="pb-4 pt-3 sm:pb-6 sm:pt-4">
                    <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">
                      <TabsList className={cn("h-auto w-max min-w-max gap-1 rounded-lg bg-muted/60 p-1", "flex flex-nowrap justify-start", "sm:grid sm:w-full sm:min-w-0 sm:grid-cols-5")}>
                        <TabsTrigger value="resumo" className="flex-none shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm">Resumo</TabsTrigger>
                        <TabsTrigger value="cliente" className="flex-none shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm">Remetente</TabsTrigger>
                        <TabsTrigger value="destino" className="flex-none shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm">Destino</TabsTrigger>
                        <TabsTrigger value="agendamento" className="flex-none shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm">Agendamento</TabsTrigger>
                        <TabsTrigger value="caixas" className="flex-none shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm">Caixas ({nCaixas})</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="resumo">
                      <ResumoTabContent ordem={o} />
                    </TabsContent>

                    <TabsContent value="cliente">
                      <ClienteTabContent ordem={o} />
                    </TabsContent>

                    <TabsContent value="destino">
                      <DestinoTabContent ordem={o} />
                    </TabsContent>

                    <TabsContent value="agendamento">
                      <AgendamentoTabContent ordem={o} />
                    </TabsContent>

                    <TabsContent value="caixas">
                      <CaixasTabContent ordem={o} onOpenRecibo={onOpenRecibo} />
                    </TabsContent>
                  </Tabs>
                );
              })()}
            </div>
          </>
        ) : (
          <DialogHeader className="px-6 py-6">
            <DialogTitle>Detalhes da ordem</DialogTitle>
            <DialogDescription>Selecione uma ordem na lista para visualizar.</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}

