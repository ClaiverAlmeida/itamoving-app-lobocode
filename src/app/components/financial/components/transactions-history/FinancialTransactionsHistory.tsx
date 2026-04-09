import React, { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import type { FinancialTransaction } from "../../../../api";
import { filterTransacoesBySearch, sortFinancialTransactionsNewestFirst } from "../../financial.utils";
import { FinancialTransactionsHistorySearch } from "./FinancialTransactionsHistorySearch";
import { FinancialTransactionsHistoryListPanel } from "./FinancialTransactionsHistoryListPanel";

type HistoryTab = "receitas" | "despesas";

export function FinancialTransactionsHistory(props: {
  transacoes: FinancialTransaction[];
  onDelete: (id: string) => void;
}) {
  const { transacoes, onDelete } = props;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<HistoryTab>("receitas");
  const [pageReceitas, setPageReceitas] = useState(1);
  const [pageDespesas, setPageDespesas] = useState(1);

  const filtradas = useMemo(() => filterTransacoesBySearch(transacoes, search), [transacoes, search]);

  const receitas = useMemo(
    () => sortFinancialTransactionsNewestFirst(filtradas.filter((t) => t.type === "REVENUE")),
    [filtradas],
  );
  const despesas = useMemo(
    () => sortFinancialTransactionsNewestFirst(filtradas.filter((t) => t.type === "EXPENSE")),
    [filtradas],
  );

  useEffect(() => {
    setPageReceitas(1);
    setPageDespesas(1);
  }, [search, transacoes]);

  const totalHistorico = receitas.length + despesas.length;

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as HistoryTab)} className="w-full">
      <Card className="overflow-hidden border-slate-200/90 shadow-sm dark:border-border">
        <CardHeader className="space-y-4 border-b border-border/60 bg-muted/30 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl tracking-tight">Histórico de transações</CardTitle>
              <CardDescription>
                {totalHistorico === 0
                  ? "Nenhuma transação no período selecionado"
                  : `${totalHistorico} no período · mais recentes primeiro`}
              </CardDescription>
            </div>
            <div className="w-full max-w-md lg:w-80">
              <FinancialTransactionsHistorySearch value={search} onChange={setSearch} />
            </div>
          </div>

          <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1 sm:max-w-lg">
            <TabsTrigger
              value="receitas"
              className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <TrendingUp className="size-4" />
              Receitas
              <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-xs tabular-nums dark:bg-white/10">
                {receitas.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="despesas"
              className="gap-2 data-[state=active]:bg-rose-600 data-[state=active]:text-white"
            >
              <TrendingDown className="size-4" />
              Despesas
              <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-xs tabular-nums dark:bg-white/10">
                {despesas.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="pt-6">
          <TabsContent value="receitas" className="mt-0 outline-none">
            <FinancialTransactionsHistoryListPanel
              items={receitas}
              page={pageReceitas}
              onPageChange={setPageReceitas}
              variant="REVENUE"
              onDelete={onDelete}
              emptyTitle="Nenhuma receita encontrada"
              emptyHint={search.trim() ? "Tente outro termo de busca." : "Registre uma receita ou ajuste o período acima."}
            />
          </TabsContent>
          <TabsContent value="despesas" className="mt-0 outline-none">
            <FinancialTransactionsHistoryListPanel
              items={despesas}
              page={pageDespesas}
              onPageChange={setPageDespesas}
              variant="EXPENSE"
              onDelete={onDelete}
              emptyTitle="Nenhuma despesa encontrada"
              emptyHint={search.trim() ? "Tente outro termo de busca." : "Registre uma despesa ou ajuste o período acima."}
            />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
