import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ClipboardList,
  Search,
  Eye,
  Pencil,
  Printer,
  CheckCircle2,
  Clock,
  Trash,
  ContainerIcon,
  ArchiveRestore,
  Archive,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { DeliveryReceipt, totalGeralConsolidadoOrdem } from "./driver-service-order/delivery-receipt";
import OrdemServicoForm from "./driver-service-order/service-order-form";
import { type DriverServiceOrderView } from "../api";
import {
  ServiceOrderDetailsDialog,
  STATUS_LABEL,
  agendamentoFromOrdem,
  formatDateTime,
  formatUsd,
  serviceOrderCrud,
} from "./driver-service-order/service-order";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function OrdemDeServicoView() {
  const [ordens, setOrdens] = useState<DriverServiceOrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaLista, setAbaLista] = useState<"ativas" | "arquivadas">("ativas");
  const [ordensArquivadas, setOrdensArquivadas] = useState<DriverServiceOrderView[]>([]);
  const [loadingArquivadas, setLoadingArquivadas] = useState(false);

  const carregarOrdens = useCallback(async () => {
    setLoading(true);
    const result = await serviceOrderCrud.getAll();
    if (result.success && result.data) {
      setOrdens(result.data);
    } else {
      setOrdens([]);
      toast.error(result.error ?? "Não foi possível carregar as ordens.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregarOrdens();
  }, [carregarOrdens]);

  const carregarArquivadas = useCallback(async () => {
    setLoadingArquivadas(true);
    const result = await serviceOrderCrud.getArchived();
    if (result.success && result.data) {
      setOrdensArquivadas(result.data);
    } else {
      setOrdensArquivadas([]);
      if (result.error) toast.error(result.error);
    }
    setLoadingArquivadas(false);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewOrdem, setViewOrdem] = useState<DriverServiceOrderView | null>(null);
  const [editingOrdem, setEditingOrdem] = useState<DriverServiceOrderView | null>(null);
  const [editingOrdemLoading, setEditingOrdemLoading] = useState(false);
  const [reciboOrdem, setReciboOrdem] = useState<DriverServiceOrderView | null>(null);
  const [reciboLoading, setReciboLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const { user } = useAuth();
  const isPodeArquivar = Boolean(user?.role.includes("admin"));

  const iniciarEdicao = useCallback(async (o: DriverServiceOrderView) => {
    setEditingOrdemLoading(true);
    try {
      if (o.id) {
        const res = await serviceOrderCrud.getById(o.id);
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
    const base = !q
      ? ordens
      : ordens.filter((o) => {
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

    // Ordena por "atualizado" (mais recente primeiro). Caso `updatedAt` venha ausente,
    // cai para `signatureDate`.
    const ts = (o: DriverServiceOrderView) => {
      const raw = o.updatedAt;
      const d = raw ? new Date(raw) : null;
      return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
    };

    return [...base].sort((a, b) => ts(b) - ts(a));
  }, [ordens, searchTerm]);

  const ordensArquivadasFiltradas = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = !q
      ? ordensArquivadas
      : ordensArquivadas.filter((o) => {
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

    const ts = (o: DriverServiceOrderView) => {
      const raw = o.updatedAt;
      const d = raw ? new Date(raw) : null;
      return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
    };

    return [...base].sort((a, b) => ts(b) - ts(a));
  }, [ordensArquivadas, searchTerm]);

  const stats = useMemo(() => {
    const list = ordens;
    return {
      total: list.length,
      completed: list.filter((o) => o.status === "COMPLETED").length,
      active: list.filter((o) => o.status !== "COMPLETED").length,
    };
  }, [ordens]);

  const emArquivadas = isPodeArquivar && abaLista === "arquivadas";
  const listaExibida = emArquivadas ? ordensArquivadasFiltradas : ordensFiltradas;
  const carregandoLista = emArquivadas ? loadingArquivadas : loading;

  useEffect(() => {
    if (isPodeArquivar && abaLista === "arquivadas") {
      void carregarArquivadas();
    }
  }, [abaLista, isPodeArquivar, carregarArquivadas]);

  const openView = useCallback(
    (o: DriverServiceOrderView) => {
      void (async () => {
        if (o.id && emArquivadas) {
          const res = await serviceOrderCrud.getById(o.id, { includeDeleted: true });
          if (res.success && res.data) {
            setViewOrdem(res.data);
            setViewOpen(true);
            return;
          }
        }
        setViewOrdem(o);
        setViewOpen(true);
      })();
    },
    [emArquivadas],
  );

  const excluirOrdem = useCallback(
    async (order: DriverServiceOrderView) => {
      if (!user?.role.includes("admin")) return;

      const confirm = window.confirm(
        `Arquivar esta ordem de serviço?\n\nCliente (EUA): ${order.sender.usaName}\nNúmero: #${order.id}\n\nA ordem deixa de aparecer na lista principal; produtos e itens permanecem no registo. Pode desarquivar depois na aba Arquivadas.`,
      );
      if (confirm) {
        const result = await serviceOrderCrud.remove(order.id!);
        if (!result.success) {
          toast.error(result.error || "Erro ao arquivar ordem de serviço");
          return;
        }
        toast.success("Ordem de serviço arquivada com sucesso");
        void carregarOrdens();
      }
    },
    [user, carregarOrdens],
  );

  const desarquivarOrdem = useCallback(
    async (order: DriverServiceOrderView) => {
      if (!user?.role.includes("admin")) return;

      const confirm = window.confirm(
        `Desarquivar esta ordem de serviço?\n\nCliente (EUA): ${order.sender.usaName}\nNúmero: #${order.id}\n\nEla voltará à lista de ordens ativas.`,
      );
      if (!confirm) return;
      const result = await serviceOrderCrud.restore(order.id!);
      if (!result.success) {
        toast.error(result.error || "Erro ao desarquivar ordem de serviço");
        return;
      }
      toast.success("Ordem de serviço desarquivada com sucesso");
      void carregarArquivadas();
      void carregarOrdens();
    },
    [user, carregarArquivadas, carregarOrdens],
  );

  const fecharRecibo = useCallback(() => setReciboOrdem(null), []);

  /** Mesma ideia do formulário / app motorista: recibo em ecrã cheio + GET por id para dados completos (PDF/impressão). */
  const abrirRecibo = useCallback(
    async (o: DriverServiceOrderView) => {
      setReciboLoading(true);
      try {
        if (o.id) {
          const res = await serviceOrderCrud.getById(o.id, {
            includeDeleted: emArquivadas,
          });
          if (res.success && res.data) {
            setReciboOrdem(res.data);
            return;
          }
        }
        setReciboOrdem(o);
      } finally {
        setReciboLoading(false);
      }
    },
    [emArquivadas],
  );

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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Ordens registradas</CardTitle>
              <CardDescription>
                {emArquivadas
                  ? "Ordens arquivadas — visualize, imprima o recibo ou desarquive para voltar à lista principal."
                  : "Busque por cliente, motorista, número da ordem ou agendamento."}
              </CardDescription>
            </div>
            {isPodeArquivar ? (
              <div className="flex gap-1 rounded-lg border bg-muted/60 p-1 w-fit shrink-0">
                <Button
                  type="button"
                  variant={abaLista === "ativas" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5 px-2.5"
                  onClick={() => setAbaLista("ativas")}
                >
                  <ListChecks className="size-3.5 shrink-0 opacity-90" aria-hidden />
                  Ordens ativas
                </Button>
                <Button
                  type="button"
                  variant={abaLista === "arquivadas" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5 px-2.5"
                  onClick={() => setAbaLista("arquivadas")}
                >
                  <Archive className="size-3.5 shrink-0 opacity-90" aria-hidden />
                  Arquivadas
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {carregandoLista ? (
            <p className="text-center py-14 text-muted-foreground">
              {emArquivadas ? "Carregando ordens arquivadas…" : "Carregando ordens…"}
            </p>
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
                      <TableHead className="text-center">Container</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Data assinatura</TableHead>
                      <TableHead className="text-center">Total geral (USD)</TableHead>
                      <TableHead className="text-center w-[200px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listaExibida.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          {emArquivadas
                            ? "Nenhuma ordem arquivada."
                            : "Nenhuma ordem de serviço encontrada."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      ordensFiltradas.map((o) => (
                        <TableRow key={o.id} className="hover:bg-muted/30 text-center">
                          <TableCell className="font-mono text-sm">#{o.id}</TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium">{o.sender.usaName}</div>
                            <div className="font-normal text-xs text-muted-foreground">{o.sender.usaAddress.rua}, {o.sender.usaAddress.numero}, {o.sender.usaAddress.cidade}, {o.sender.usaAddress.estado}, {o.sender.usaAddress.zipCode}</div>
                          </TableCell>
                          {o.container && (
                            <TableCell className="text-center flex items-center gap-2">
                              <ContainerIcon className="w-4 h-4 text-muted-foreground" />
                              <div className="font-semibold flex flex-col gap-1">
                                <div>{o.container.number ?? "-"}</div>
                                <div className="text-xs text-muted-foreground">{o.container.type ?? "-"}</div>
                              </div>
                            </TableCell>
                          )}
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
                          <TableCell className="text-center font-semibold tabular-nums text-green-600">
                            {formatUsd(totalGeralConsolidadoOrdem(o))}
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
                              {!emArquivadas ? (
                                <>
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
                                    title="Arquivar"
                                    onClick={() => void excluirOrdem(o)}
                                    disabled={!user?.role.includes("admin")}
                                    className={`${!user?.role.includes("admin") ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                                  >
                                    <Archive className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Desarquivar"
                                  onClick={() => void desarquivarOrdem(o)}
                                  disabled={!user?.role.includes("admin")}
                                  className={`${!user?.role.includes("admin") ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                                >
                                  <ArchiveRestore className="w-4 h-4" />
                                </Button>
                              )}
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
                {listaExibida.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                      {emArquivadas
                        ? "Nenhuma ordem arquivada."
                        : "Nenhuma ordem de serviço encontrada."}
                    </CardContent>
                  </Card>
                ) : (
                  listaExibida.map((o, index) => (
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
                            <span className="text-muted-foreground">Total geral</span>
                            <span className="font-semibold tabular-nums">
                              {formatUsd(totalGeralConsolidadoOrdem(o))}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">Assinatura</span>
                            <span className="text-right text-xs">
                              {formatDateTime(o.signatureDate)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 min-w-[88px]"
                              size="sm"
                              onClick={() => openView(o)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            {!emArquivadas ? (
                              <Button
                                type="button"
                                className="flex-1 min-w-[88px] bg-[#1E3A5F]"
                                size="sm"
                                onClick={() => void iniciarEdicao(o)}
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            ) : (
                              isPodeArquivar && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="flex-1 min-w-[88px]"
                                  size="sm"
                                  onClick={() => void desarquivarOrdem(o)}
                                >
                                  <ArchiveRestore className="w-4 h-4 mr-1" />
                                  Desarquivar
                                </Button>
                              )
                            )}
                            <Button
                              type="button"
                              variant="secondary"
                              className="flex-1 min-w-[88px]"
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

      <ServiceOrderDetailsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        viewOrdem={viewOrdem}
        onOpenRecibo={(o) => {
          setViewOpen(false);
          void abrirRecibo(o);
        }}
      />

    </div>
  );
}
