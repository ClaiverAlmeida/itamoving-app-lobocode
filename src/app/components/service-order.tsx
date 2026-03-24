import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  ClipboardList,
  Search,
  Eye,
  Pencil,
  Printer,
  Truck,
  Calendar,
  MapPin,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import type { OrdemServicoMotorista } from "../types";
import { DeliveryReceipt } from "./driver-service-order/delivery-receipt";
import OrdemServicoForm from "./driver-service-order/service-order-form";
import { RECIBO_CATEGORY_LABEL, summarizeOrdemForRecibo } from "./driver-service-order/delivery-receipt-utils";
import { serviceOrderFormService, type OrdemServicoView } from "../services/driver-service-order/service-order-form.service";
import { cn } from "./ui/utils";

/** Dados de agendamento/empresa para a aba “Agendamento” (vindos do GET quando disponíveis). */
type AgendamentoResumo = {
  collectionDate: string;
  collectionTime: string;
  companyAddress: string;
  companyPhone?: string;
  isPeriodic: boolean;
};

const STATUS_LABEL: Record<OrdemServicoMotorista["status"], string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
};

function formatUsd(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "USD" });
}

function formatDateTime(iso: string) {
  try {
    return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

function formatCollectionDate(dateStr: string | undefined) {
  if (!dateStr) return "—";
  const prefix = dateStr.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(prefix);
  if (m) {
    const localDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
  }
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
}

/** Estrutura esperada por `OrdemServicoForm` (cliente + empresa + metadados do agendamento). */
function agendamentoFromOrdem(ordem: OrdemServicoView) {
  const apt = ordem.appointment;
  const comp = ordem.company;
  return {
    id: ordem.appointmentId,
    status: "CONFIRMED",
    isPeriodic: apt?.isPeriodic ?? false,
    collectionDate: apt?.collectionDate ?? "",
    collectionTime: apt?.collectionTime ?? "",
    client: {
      usaName: ordem.sender.usaName,
      usaPhone: ordem.sender.usaPhone,
      usaCpf: ordem.sender.usaCpf,
      usaAddress: {
        rua: ordem.sender.usaAddress.rua,
        numero: ordem.sender.usaAddress.numero,
        cidade: ordem.sender.usaAddress.cidade,
        estado: ordem.sender.usaAddress.estado,
        zipCode: ordem.sender.usaAddress.zipCode,
        complemento: ordem.sender.usaAddress.complemento ?? "",
      },
      brazilName: ordem.recipient.brazilName,
      brazilCpf: ordem.recipient.brazilCpf,
      brazilPhone: ordem.recipient.brazilPhone,
      brazilAddress: {
        rua: ordem.recipient.brazilAddress.rua,
        bairro: ordem.recipient.brazilAddress.bairro,
        cidade: ordem.recipient.brazilAddress.cidade,
        estado: ordem.recipient.brazilAddress.estado,
        cep: ordem.recipient.brazilAddress.cep,
        numero: ordem.recipient.brazilAddress.numero ?? "",
        complemento: ordem.recipient.brazilAddress.complemento ?? "",
      },
    },
    company: {
      address: comp?.address ?? comp?.name ?? "—",
      contactPhone: comp?.contactPhone ?? "—",
    },
  };
}

function agendamentoResumoParaExibicao(ordem: OrdemServicoView): AgendamentoResumo | null {
  const apt = ordem.appointment;
  const comp = ordem.company;
  if (!apt && !comp) return null;
  return {
    collectionDate: apt?.collectionDate ?? "",
    collectionTime: apt?.collectionTime ?? "",
    companyAddress: comp?.address ?? comp?.name ?? "—",
    companyPhone: comp?.contactPhone,
    isPeriodic: Boolean(apt?.isPeriodic),
  };
}

function ViewField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm text-foreground leading-snug">{children}</div>
    </div>
  );
}

function statusBadgeClass(status: OrdemServicoMotorista["status"]) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-900 border-emerald-200/80";
  if (status === "IN_PROGRESS") return "bg-amber-50 text-amber-900 border-amber-200/80";
  return "bg-slate-100 text-slate-800 border-slate-200/80";
}

export default function OrdemDeServicoView() {
  const [ordens, setOrdens] = useState<OrdemServicoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const carregarOrdens = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const result = await serviceOrderFormService.getAll();
    if (result.success && result.data) {
      setOrdens(result.data);
    } else {
      setOrdens([]);
      setLoadError(result.error ?? "Não foi possível carregar as ordens.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregarOrdens();
  }, [carregarOrdens]);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewOrdem, setViewOrdem] = useState<OrdemServicoView | null>(null);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServicoView | null>(null);
  const [editingOrdemLoading, setEditingOrdemLoading] = useState(false);
  const [reciboOrdem, setReciboOrdem] = useState<OrdemServicoView | null>(null);
  const [reciboLoading, setReciboLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const iniciarEdicao = useCallback(async (o: OrdemServicoView) => {
    setEditingOrdemLoading(true);
    try {
      if (o.id) {
        const res = await serviceOrderFormService.getById(o.id);
        if (res.success && res.data) {
          setEditingOrdem(res.data);
          return;
        }
      }
      setEditingOrdem(o);
    } finally {
      setEditingOrdemLoading(false);
    }
  }, []);

  const fecharEdicao = useCallback(() => {
    setEditingOrdem(null);
    setEditingOrdemLoading(false);
  }, []);

  const ordensFiltradas = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return ordens;
    return ordens.filter((o) => {
      const blob = [
        o.id,
        o.appointmentId,
        o.sender?.usaName,
        o.recipient?.brazilName,
        o.driverName,
        o.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [ordens, searchTerm]);

  const stats = useMemo(() => {
    const list = ordens;
    return {
      total: list.length,
      completed: list.filter((o) => o.status === "COMPLETED").length,
      active: list.filter((o) => o.status !== "COMPLETED").length,
    };
  }, [ordens]);

  const openView = (o: OrdemServicoView) => {
    setViewOrdem(o);
    setViewOpen(true);
  };

  const fecharRecibo = useCallback(() => setReciboOrdem(null), []);

  /** Mesma ideia do formulário / app motorista: recibo em ecrã cheio + GET por id para dados completos (PDF/impressão). */
  const abrirRecibo = useCallback(async (o: OrdemServicoView) => {
    setReciboLoading(true);
    try {
      if (o.id) {
        const res = await serviceOrderFormService.getById(o.id);
        if (res.success && res.data) {
          setReciboOrdem(res.data);
          return;
        }
      }
      setReciboOrdem(o);
    } finally {
      setReciboLoading(false);
    }
  }, []);

  if (editingOrdemLoading) {
    return (
      <div className="min-w-0 flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
        Carregando ordem para edição…
      </div>
    );
  }

  if (reciboLoading) {
    return (
      <div className="min-w-0 flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
        Carregando recibo…
      </div>
    );
  }

  if (reciboOrdem) {
    return (
      <div className="min-w-0 space-y-4 pb-8 px-2 sm:px-0">
        <DeliveryReceipt
          ordem={reciboOrdem}
          companyContactPhone={reciboOrdem.company?.contactPhone}
          printElementId={`delivery-receipt-print-${reciboOrdem.id ?? "ordem"}`}
          onPrint={() => window.print()}
          onShowOrdersScreen={fecharRecibo}
          backLabel="← Voltar à lista de ordens"
          printLabel="Imprimir / PDF"
        />
      </div>
    );
  }

  if (editingOrdem) {
    return (
      <div className="min-w-0 space-y-4 pb-8">
        <OrdemServicoForm
          key={editingOrdem.id ?? editingOrdem.appointmentId}
          appointmentId={editingOrdem.appointmentId}
          agendamento={agendamentoFromOrdem(editingOrdem)}
          existingOrdem={editingOrdem}
          embedded
          onClose={fecharEdicao}
          onSave={(_ordemAtualizada) => {
            fecharEdicao();
            void carregarOrdens();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-[#1E3A5F]" />
            Ordem de Serviço
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Consulte, edite e imprima recibos das ordens registradas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-l-4 border-l-[#1E3A5F]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de ordens
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-2xl font-bold">{stats.total}</span>
              <ClipboardList className="w-8 h-8 text-[#1E3A5F] opacity-80" />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-2xl font-bold text-green-700">{stats.completed}</span>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes / em andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-2xl font-bold text-amber-700">{stats.active}</span>
              <Clock className="w-8 h-8 text-amber-600" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Ordens registradas</CardTitle>
          <CardDescription>
            Dados carregados da API. Busque por cliente, motorista, número da ordem ou agendamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center py-14 text-muted-foreground">Carregando ordens…</p>
          ) : (
            <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Desktop: tabela */}
          <div className="hidden md:block border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">Nº</TableHead>
                  <TableHead className="text-center">Cliente (remetente)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Data assinatura</TableHead>
                  <TableHead className="text-center">Valor (USD)</TableHead>
                  <TableHead className="text-center w-[200px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordensFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhuma ordem encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordensFiltradas.map((o) => (
                    <TableRow key={o.id} className="hover:bg-muted/30 text-center">
                      <TableCell className="font-mono text-sm">#{o.id}</TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{o.sender.usaName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                          Ag. {o.appointmentId}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            o.status === "COMPLETED"
                              ? "default"
                              : o.status === "IN_PROGRESS"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            o.status === "COMPLETED"
                              ? "bg-green-100 text-green-900 hover:bg-green-100"
                              : ""
                          }
                        >
                          {STATUS_LABEL[o.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {formatDateTime(o.signatureDate)}
                      </TableCell>
                      <TableCell className="text-center font-semibold tabular-nums">
                        {formatUsd(o.chargedValue ?? 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Visualizar"
                            onClick={() => openView(o)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={() => void iniciarEdicao(o)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Recibo"
                            onClick={() => void abrirRecibo(o)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden grid gap-3">
            {ordensFiltradas.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Nenhuma ordem encontrada.
                </CardContent>
              </Card>
            ) : (
              ordensFiltradas.map((o, index) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-l-4 border-l-[#F5A623] overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-base break-words">
                            {o.sender.usaName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            #{o.id}
                          </p>
                        </div>
                        <Badge
                          variant={o.status === "COMPLETED" ? "default" : "secondary"}
                          className={
                            o.status === "COMPLETED"
                              ? "bg-green-100 text-green-900 shrink-0"
                              : "shrink-0"
                          }
                        >
                          {STATUS_LABEL[o.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Valor</span>
                        <span className="font-semibold tabular-nums">
                          {formatUsd(o.chargedValue ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Assinatura</span>
                        <span className="text-right text-xs">
                          {formatDateTime(o.signatureDate)}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          onClick={() => openView(o)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 bg-[#1E3A5F]"
                          size="sm"
                          onClick={() => void iniciarEdicao(o)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1"
                          size="sm"
                          onClick={() => void abrirRecibo(o)}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Recibo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visualizar — desktop largo (override sm:max-w-lg do Dialog); mobile quase tela cheia + abas em scroll */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent
          className={cn(
            "flex flex-col gap-0 overflow-hidden rounded-xl border border-border/80 p-0 shadow-lg",
            // Mobile: altura limitada (não ocupa 100% do ecrã)
            "h-[min(85dvh,100svh)] max-h-[min(85dvh,680px)] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)]",
            // Desktop: mais baixo (~72vh / 600px máx.); override do sm:max-w-lg do Dialog
            "sm:h-[min(72vh,600px)] sm:max-h-[min(72vh,600px)] sm:w-[min(92vw,56rem)] sm:max-w-none sm:!max-w-[min(56rem,calc(100vw-2rem))] lg:!max-w-[min(60rem,calc(100vw-3rem))]",
          )}
        >
          {viewOrdem ? (
            <>
              <DialogHeader className="shrink-0 space-y-0 border-b border-border/80 bg-gradient-to-br from-[#1E3A5F]/[0.07] via-background to-background px-4 py-4 pr-12 text-left sm:px-6 sm:py-5 sm:pr-14">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-1">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-[#1E3A5F] sm:text-2xl">
                      Ordem de serviço
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-foreground/90">#{viewOrdem.id}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="font-mono text-xs sm:text-sm">Ag. {viewOrdem.appointmentId}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Badge
                      variant="outline"
                      className={`border font-medium ${statusBadgeClass(viewOrdem.status)}`}
                    >
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

              <ScrollArea
                className={cn(
                  "min-h-0 flex-1 px-3 pb-4 pt-0 sm:px-6",
                  // Ocupa o espaço restante sob o cabeçalho (flex no DialogContent)
                  "max-h-[calc(min(85dvh,680px)-9rem)] sm:max-h-[calc(min(72vh,600px)-10.5rem)]",
                )}
              >
                {(() => {
                  const o = viewOrdem;
                  const agResumo = agendamentoResumoParaExibicao(o);
                  const nCaixas = o.driverServiceOrderProducts?.length ?? 0;
                  const { summary, totalUnidades } = summarizeOrdemForRecibo(o);
                  return (
                    <Tabs defaultValue="resumo" className="pb-4 pt-3 sm:pb-6 sm:pt-4">
                      <TabsList
                        className={cn(
                          "h-auto w-full gap-1 rounded-lg bg-muted/60 p-1",
                          // Mobile: uma linha com scroll horizontal (evita grelha quebrada)
                          "flex flex-nowrap justify-start overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                          "sm:grid sm:grid-cols-5 sm:overflow-visible",
                        )}
                      >
                        <TabsTrigger
                          value="resumo"
                          className="flex-none shrink-0 px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm"
                        >
                          Resumo
                        </TabsTrigger>
                        <TabsTrigger
                          value="cliente"
                          className="flex-none shrink-0 px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm"
                        >
                          Remetente
                        </TabsTrigger>
                        <TabsTrigger
                          value="destino"
                          className="flex-none shrink-0 px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm"
                        >
                          Destino
                        </TabsTrigger>
                        <TabsTrigger
                          value="agendamento"
                          className="flex-none shrink-0 px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm"
                        >
                          Agendamento
                        </TabsTrigger>
                        <TabsTrigger
                          value="caixas"
                          className="flex-none shrink-0 px-3 py-2 text-xs sm:flex-1 sm:px-3 sm:py-1.5 sm:text-sm"
                        >
                          Caixas ({nCaixas})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="resumo" className="mt-4 space-y-4 sm:mt-5">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Status
                            </p>
                            <Badge
                              variant="outline"
                              className={`mt-2 border font-medium ${statusBadgeClass(o.status)}`}
                            >
                              {STATUS_LABEL[o.status]}
                            </Badge>
                          </div>
                          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Valor cobrado
                            </p>
                            <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-[#1E3A5F]">
                              {formatUsd(o.chargedValue ?? 0)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:col-span-2 xl:col-span-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Motorista
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
                                <Truck className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">{o.driverName || "—"}</span>
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:col-span-2 xl:col-span-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Assinatura
                            </p>
                            <p className="mt-2 text-sm text-foreground">{formatDateTime(o.signatureDate)}</p>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                            <p className="text-xs font-semibold text-[#1E3A5F]">Remetente (EUA)</p>
                            <p className="mt-2 font-medium leading-snug">{o.sender.usaName}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{o.sender.usaPhone}</p>
                          </div>
                          <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                            <p className="text-xs font-semibold text-[#1E3A5F]">Destinatário (Brasil)</p>
                            <p className="mt-2 font-medium leading-snug">{o.recipient.brazilName}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {o.recipient.brazilAddress.cidade} / {o.recipient.brazilAddress.estado}
                            </p>
                          </div>
                        </div>

                        {o.observations ? (
                          <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-4">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                              Observações
                            </p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{o.observations}</p>
                          </div>
                        ) : null}
                      </TabsContent>

                      <TabsContent value="cliente" className="mt-4 sm:mt-5">
                        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
                            <User className="h-4 w-4 shrink-0" />
                            Remetente (Estados Unidos)
                          </div>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <ViewField label="Nome completo">{o.sender.usaName}</ViewField>
                            <ViewField label="Telefone">
                              <span className="inline-flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {o.sender.usaPhone}
                              </span>
                            </ViewField>
                            <ViewField label="CPF / documento">{o.sender.usaCpf}</ViewField>
                            <ViewField label="Endereço (linha 1) & número" className="sm:col-span-2">
                              {o.sender.usaAddress.rua}, {o.sender.usaAddress.numero}
                              {o.sender.usaAddress.complemento
                                ? ` — ${o.sender.usaAddress.complemento}`
                                : ""}
                            </ViewField>
                            <ViewField label="Cidade, estado e ZIP">
                              {o.sender.usaAddress.cidade} — {o.sender.usaAddress.estado}{" "}
                              <span className="font-mono">{o.sender.usaAddress.zipCode}</span>
                            </ViewField>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="destino" className="mt-4 sm:mt-5">
                        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
                            <MapPin className="h-4 w-4 shrink-0" />
                            Destinatário (Brasil)
                          </div>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <ViewField label="Nome completo">{o.recipient.brazilName}</ViewField>
                            <ViewField label="CPF">{o.recipient.brazilCpf}</ViewField>
                            <ViewField label="Telefone">
                              <span className="inline-flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {o.recipient.brazilPhone}
                              </span>
                            </ViewField>
                            <ViewField label="Logradouro & número" className="sm:col-span-2">
                              {o.recipient.brazilAddress.rua}
                              {o.recipient.brazilAddress.numero ? `, ${o.recipient.brazilAddress.numero}` : ""}
                              {o.recipient.brazilAddress.complemento
                                ? ` — ${o.recipient.brazilAddress.complemento}`
                                : ""}
                            </ViewField>
                            <ViewField label="Bairro">{o.recipient.brazilAddress.bairro}</ViewField>
                            <ViewField label="Cidade / UF / CEP">
                              {o.recipient.brazilAddress.cidade} / {o.recipient.brazilAddress.estado} · CEP{" "}
                              <span className="font-mono">{o.recipient.brazilAddress.cep}</span>
                            </ViewField>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="agendamento" className="mt-4 sm:mt-5">
                        {agResumo ? (
                          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
                              <Calendar className="h-4 w-4 shrink-0" />
                              Agendamento vinculado
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                              <ViewField label="ID do agendamento">
                                <span className="font-mono text-sm">{o.appointmentId}</span>
                              </ViewField>
                              <ViewField label="Coleta">
                                <span>
                                  {formatCollectionDate(agResumo.collectionDate)}
                                  {agResumo.collectionTime ? ` às ${agResumo.collectionTime}` : ""}
                                </span>
                              </ViewField>
                              <ViewField label="Tipo" className="sm:col-span-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    agResumo.isPeriodic
                                      ? "border-emerald-300 text-emerald-800"
                                      : "border-sky-300 text-sky-800"
                                  }
                                >
                                  {agResumo.isPeriodic ? "Periódico" : "Único"}
                                </Badge>
                              </ViewField>
                              <ViewField label="Endereço / base (empresa)" className="sm:col-span-2">
                                <span className="inline-flex items-start gap-2">
                                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  {agResumo.companyAddress}
                                </span>
                              </ViewField>
                              {agResumo.companyPhone ? (
                                <ViewField label="Contato da empresa" className="sm:col-span-2">
                                  <span className="inline-flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    {agResumo.companyPhone}
                                  </span>
                                </ViewField>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-950">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                              <p className="font-medium">Resumo de agendamento indisponível</p>
                              <p className="mt-1 text-sm opacity-90">
                                Só temos o identificador nesta resposta:{" "}
                                <span className="font-mono">{o.appointmentId}</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="caixas" className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
                            <Package className="h-4 w-4" />
                            Caixas e itens ({nCaixas})
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full shrink-0 sm:w-auto"
                            onClick={() => {
                              setViewOpen(false);
                              void abrirRecibo(o);
                            }}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Abrir recibo
                          </Button>
                        </div>

                        {nCaixas === 0 ? (
                          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                            Nenhuma caixa registrada nesta ordem.
                          </p>
                        ) : (
                          <div className="-mx-1 overflow-x-auto rounded-xl border border-border/80 sm:mx-0">
                            <Table className="min-w-[640px] sm:min-w-0">
                              <TableHeader>
                                <TableRow className="border-b bg-muted/60 hover:bg-muted/60">
                                  <TableHead className="w-[72px] font-semibold">Nº</TableHead>
                                  <TableHead className="min-w-[200px] font-semibold">Tipo / conteúdo</TableHead>
                                  <TableHead className="text-right font-semibold tabular-nums">
                                    Peso (kg)
                                  </TableHead>
                                  <TableHead className="text-right font-semibold tabular-nums">Valor</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {o.driverServiceOrderProducts.map((p, rowIdx) => (
                                  <TableRow
                                    key={p.id}
                                    className={rowIdx % 2 === 1 ? "bg-muted/20" : undefined}
                                  >
                                    <TableCell className="align-top font-mono font-semibold tabular-nums">
                                      {p.number}
                                    </TableCell>
                                    <TableCell className="align-top">
                                      <div className="max-w-xl text-sm font-medium leading-snug">{p.type}</div>
                                      {(p.driverServiceOrderProductsItems?.length ?? 0) > 0 ? (
                                        <ul className="mt-2 space-y-1.5 rounded-lg border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                                          {p.driverServiceOrderProductsItems!.map((it, i) => (
                                            <li key={i} className="flex flex-wrap gap-x-2 gap-y-0.5">
                                              <span className="font-medium text-foreground">{it.name}</span>
                                              <span className="tabular-nums">×{it.quantity}</span>
                                              <span className="tabular-nums">{Number(it.weight).toFixed(2)} kg</span>
                                              {it.observations ? (
                                                <span className="w-full text-[11px] italic opacity-90">
                                                  {it.observations}
                                                </span>
                                              ) : null}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="mt-2 text-xs text-muted-foreground">Sem itens listados.</p>
                                      )}
                                    </TableCell>
                                    <TableCell className="align-top text-right text-sm tabular-nums">
                                      {Number(p.weight).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="align-top text-right text-sm font-medium tabular-nums">
                                      {formatUsd(p.value)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        <div className="rounded-xl border border-border/80 bg-muted/15 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Resumo por tipo (recibo)
                          </p>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {Object.entries(RECIBO_CATEGORY_LABEL).map(([k, label]) => (
                              <li
                                key={k}
                                className="flex items-center justify-between gap-3 rounded-md bg-background/80 px-3 py-2 text-sm"
                              >
                                <span className="text-muted-foreground">{label}</span>
                                <span className="tabular-nums font-semibold">
                                  {summary[k as keyof typeof summary]}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-4 border-t border-border/60 pt-3 text-sm font-semibold">
                            Total de unidades:{" "}
                            <span className="tabular-nums text-[#1E3A5F]">{totalUnidades}</span>
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  );
                })()}
              </ScrollArea>
            </>
          ) : (
            <DialogHeader className="px-6 py-6">
              <DialogTitle>Detalhes da ordem</DialogTitle>
              <DialogDescription>Selecione uma ordem na lista para visualizar.</DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
