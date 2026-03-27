import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Container, OrdemServicoMotorista } from "../../../api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { containersCrud } from "../containers.crud";
import { isValidVolumeLetter, previewNextLabels } from "../utils/container-box-numbering.utils";
import { ServiceOrderBoxesPreview } from "./ServiceOrderBoxesPreview";
import type { OrdemServicoView } from "../../../api/services/driver-service-order/service-order-form.service";
import {
  Container as ContainerIcon,
  Hash,
  Loader2,
  PackagePlus,
  Truck,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: Container;
  onSuccess: (updated: Container) => void;
};

function labelOrdem(o: OrdemServicoView): string {
  const nome = o.recipient?.brazilName?.trim() || o.sender?.usaName?.trim() || "Ordem";
  const shortId = o.id ? o.id.slice(-8) : "";
  return `${nome} · …${shortId}`;
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
  onSuccess,
}: Props) {
  const [orders, setOrders] = useState<OrdemServicoView[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<OrdemServicoMotorista | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [letterDraft, setLetterDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  /** Container atualizado do servidor ao abrir (letra, caixas, contagem de ordens) para várias vinculações seguidas. */
  const [workingContainer, setWorkingContainer] = useState(container);

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

  useEffect(() => {
    if (!open) return;
    setWorkingContainer(container);
    void loadList();
    setSelectedId("");
    setDetail(null);
    setLetterDraft("");
    if (!container.id) return;
    let cancelled = false;
    void containersCrud.getById(container.id).then((r) => {
      if (cancelled) return;
      if (r.success && r.data) setWorkingContainer(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, loadList, container.id]);

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

  const letterEfetiva = (
    workingContainer.volumeLetter?.trim().toUpperCase() || letterDraft.trim().toUpperCase().slice(0, 1)
  ) as string;

  const boxNumbersExistentes = useMemo(
    () => (workingContainer.boxes ?? []).map((b) => b.boxNumber),
    [workingContainer.boxes],
  );

  const nCaixasOrdem = detail?.driverServiceOrderProducts?.length ?? 0;

  const previewLabels = useMemo(() => {
    if (!detail || !isValidVolumeLetter(letterEfetiva)) return [];
    return previewNextLabels(boxNumbersExistentes, letterEfetiva, nCaixasOrdem);
  }, [boxNumbersExistentes, letterEfetiva, nCaixasOrdem, detail]);

  const pesoNovas = useMemo(() => {
    if (!detail?.driverServiceOrderProducts) return 0;
    return detail.driverServiceOrderProducts.reduce((s, p) => s + (p.weight ?? 0), 0);
  }, [detail]);

  const pesoAtualContainer = useMemo(
    () => (workingContainer.boxes ?? []).reduce((s, b) => s + (b.weight ?? 0), 0),
    [workingContainer.boxes],
  );

  const cap = workingContainer.volumeCapacity ?? 220;
  const atual = workingContainer.boxes?.length ?? 0;
  const fullW = workingContainer.fullWeight;
  const precisaLetra = !workingContainer.volumeLetter?.trim();

  const confirmar = async () => {
    if (!workingContainer.id || !selectedId) return;
    if (precisaLetra && !isValidVolumeLetter(letterDraft)) {
      toast.error("Informe uma letra de volume (A–Z) para este container.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await containersCrud.assignServiceOrder(workingContainer.id, {
        driverServiceOrderId: selectedId,
        ...(precisaLetra ? { volumeLetter: letterDraft.trim().toUpperCase() } : {}),
      });
      if (result.success && result.data) {
        onSuccess(result.data);
        toast.success("Ordem de serviço vinculada ao container.");
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Não foi possível vincular a ordem.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
              <DialogDescription className="text-sm leading-relaxed">
                Escolha abaixo uma ordem <strong className="text-foreground font-medium">concluída</strong> ainda sem
                container. O mesmo container pode receber <strong className="text-foreground font-medium">várias
                ordens</strong>; as caixas seguem numeração contínua (ex.: se já existem 10 volumes, a próxima ordem
                começa em <span className="font-mono text-xs bg-muted px-1 rounded">11-A</span>). A letra do volume e a
                identificação no cadastro só ficam definitivas <strong className="text-foreground font-medium">após
                </strong> a primeira vinculação que inclua caixas.
              </DialogDescription>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1">
                  <ContainerIcon className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{workingContainer.number}</span>
                </span>
                {(workingContainer.linkedServiceOrderCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1">
                    <Truck className="h-3.5 w-3.5" />
                    {workingContainer.linkedServiceOrderCount} ordem(ns) já neste container
                  </span>
                )}
                {workingContainer.volumeLetter && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1">
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
                className={`grid gap-3 pl-0 sm:pl-11 grid-cols-2 ${
                  fullW != null && fullW > 0 ? "sm:grid-cols-4" : "sm:grid-cols-3"
                }`}
              >
                <div className="rounded-lg border bg-card px-3 py-2.5 text-center">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Caixas já no container</p>
                  <p className="text-xl font-semibold tabular-nums">{atual}</p>
                </div>
                <div className="rounded-lg border bg-card px-3 py-2.5 text-center">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Limite de volumes</p>
                  <p className="text-xl font-semibold tabular-nums">{cap}</p>
                </div>
                <div className="rounded-lg border bg-card px-3 py-2.5 text-center">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Peso já carregado</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {pesoAtualContainer.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg
                  </p>
                </div>
                {fullW != null && fullW > 0 && (
                  <div className="rounded-lg border bg-card px-3 py-2.5 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Peso cheio (limite)</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {fullW.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kg
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <SectionLabel step={2}>Escolher ordem de serviço</SectionLabel>
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
                    <SelectTrigger id="aso-order" className="h-11 bg-background">
                      <SelectValue
                        placeholder={loadingList ? "Carregando ordens…" : "Selecione uma ordem"}
                      />
                    </SelectTrigger>
                    <SelectContent>
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
                      Não há ordens concluídas disponíveis no momento. Conclua uma ordem no módulo do motorista ou
                      verifique se ela já foi vinculada a outro container.
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

            {precisaLetra && (
              <>
                <Separator />
                <div>
                  <SectionLabel step={3}>Letra do volume (primeira vez neste container)</SectionLabel>
                  <div className="sm:pl-11 flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="aso-volume-letter">Uma letra de A a Z</Label>
                      <Input
                        id="aso-volume-letter"
                        maxLength={1}
                        className="h-11 w-16 text-center text-lg font-mono uppercase tracking-wider"
                        placeholder="A"
                        value={letterDraft}
                        onChange={(e) => setLetterDraft(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md pb-1">
                      As etiquetas desta ordem usarão esta letra; a letra só é gravada no container junto com as
                      caixas. Ordens futuras no mesmo container continuam a mesma letra e a numeração segue do último
                      volume.
                    </p>
                  </div>
                </div>
              </>
            )}

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

            {loadingDetail && selectedId && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Carregando caixas e itens da ordem…</p>
              </div>
            )}

            {detail && !loadingDetail && (
              <>
                <Separator />
                <div>
                  <SectionLabel step={precisaLetra ? 4 : 3}>Conferência e limites</SectionLabel>
                  <Card className="border-primary/20 bg-primary/5 sm:ml-11">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Após vincular
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        Confira se cabe no container e se o peso total não ultrapassa o limite.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 pb-4">
                      <div className="rounded-md bg-background border px-4 py-2 min-w-[140px]">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase">Volumes</p>
                        <p className="text-lg font-semibold tabular-nums">
                          {atual} + {nCaixasOrdem} ={" "}
                          <span className="text-primary">{atual + nCaixasOrdem}</span> / {cap}
                        </p>
                      </div>
                      {fullW != null && fullW > 0 && (
                        <div className="rounded-md bg-background border px-4 py-2 min-w-[180px]">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase">Peso total</p>
                          <p className="text-lg font-semibold tabular-nums">
                            {(pesoAtualContainer + pesoNovas).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} /{" "}
                            {fullW.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <ServiceOrderBoxesPreview order={detail} previewLabels={previewLabels} />
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
  );
}
