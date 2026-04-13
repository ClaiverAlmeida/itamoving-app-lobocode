import React from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Clock, Filter, MessageCircle, Search, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ITEM_LABELS, MOVIMENTACOES_PAGE_SIZE } from "../stock.constants";
import type { EstoqueMovimentacao } from "../stock.types";
import { getMovItemKey, getMovQuantity } from "../stock.utils";
import { getAppTimeZone } from "../../../utils";

type Props = {
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  movimentacoes: EstoqueMovimentacao[];
  movimentacoesFiltradas: EstoqueMovimentacao[];
  movimentacoesPaginas: EstoqueMovimentacao[];
  movimentacoesPage: number;
  totalPages: number;
  setMovimentacoesPage: React.Dispatch<React.SetStateAction<number>>;
};

export function StockMovementsHistory(props: Props) {
  const {
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    movimentacoes,
    movimentacoesFiltradas,
    movimentacoesPaginas,
    movimentacoesPage,
    totalPages,
    setMovimentacoesPage,
  } = props;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              {searchTerm.trim()
                ? `${movimentacoesFiltradas.length} de ${movimentacoes.length} movimentações`
                : `Últimas ${movimentacoes.length} movimentações registradas`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="space-y-4 pb-6">
                <div className="space-y-2">
                  <Label>Filtrar movimentações</Label>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por tipo, data, responsável, etc..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <AnimatePresence>
            {movimentacoesPaginas.map((mov) => {
              const itemKey = getMovItemKey(mov);
              const qty = getMovQuantity(mov);
              return (
                <motion.div
                  key={mov.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg border-l-4 p-4 ${mov.type === "ENTRY" ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className={`rounded-full p-2 ${mov.type === "ENTRY" ? "bg-green-100" : "bg-orange-100"}`}>
                        {mov.type === "ENTRY" ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="break-words font-semibold">{itemKey ? ITEM_LABELS[itemKey] : "-"}</span>
                          <span className="break-words text-sm text-muted-foreground">Produto: {mov.product.name}</span>
                          <Badge className={mov.type === "ENTRY" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                            {mov.type === "ENTRY" ? "Entrada" : "Saída"}
                          </Badge>
                          <span className={`font-bold ${mov.type === "ENTRY" ? "text-green-600" : "text-orange-600"}`}>
                            {mov.type === "ENTRY" ? "+" : "-"}
                            {qty}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(mov.createdAt).toLocaleDateString("pt-BR", {
                                timeZone: getAppTimeZone(),
                              })}{" "}
                              às{" "}
                              {new Date(mov.createdAt).toLocaleTimeString("pt-BR", {
                                timeZone: getAppTimeZone(),
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex min-w-0 items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="break-words">{mov.user.name}</span>
                          </div>
                        </div>
                        {mov.observations && (
                          <p className="mt-1 flex items-center gap-1 text-sm italic text-muted-foreground">
                            <MessageCircle className="h-3 w-3" />: {mov.observations}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {movimentacoesFiltradas.length > MOVIMENTACOES_PAGE_SIZE && (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Página {movimentacoesPage} de {totalPages}
              </p>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setMovimentacoesPage((p) => Math.max(1, p - 1))} disabled={movimentacoesPage <= 1}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setMovimentacoesPage((p) => Math.min(totalPages, p + 1))} disabled={movimentacoesPage >= totalPages}>
                  Próxima
                </Button>
              </div>
            </div>
          )}

          {movimentacoes.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Nenhuma movimentação registrada</p>
            </div>
          )}
          {movimentacoes.length > 0 && movimentacoesFiltradas.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Nenhuma movimentação encontrada para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

