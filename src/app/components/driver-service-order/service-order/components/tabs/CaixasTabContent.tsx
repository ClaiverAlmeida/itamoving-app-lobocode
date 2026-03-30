import React from "react";
import { Package, Printer } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../ui/table";
import type { DriverServiceOrderView } from "../../../../../api";
import { RECIBO_CATEGORY_LABEL, summarizeOrdemForRecibo } from "../../../delivery-receipt";
import { formatUsd } from "../../service-order.utils";

export function CaixasTabContent({
  ordem,
  onOpenRecibo,
}: {
  ordem: DriverServiceOrderView;
  onOpenRecibo: (ordem: DriverServiceOrderView) => void;
}) {
  const nCaixas = ordem.driverServiceOrderProducts?.length ?? 0;
  const { summary, totalUnidades } = summarizeOrdemForRecibo(ordem);

  return (
    <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
      <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex min-w-max items-center justify-between gap-3 sm:min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]">
            <Package className="h-4 w-4" />
            Caixas e itens ({nCaixas})
          </div>
          <Button type="button" variant="outline" size="sm" className="h-9 whitespace-nowrap px-3 text-xs sm:w-auto sm:text-sm" onClick={() => onOpenRecibo(ordem)}>
            <Printer className="mr-2 h-4 w-4 shrink-0" />
            Abrir recibo
          </Button>
        </div>
      </div>
      {nCaixas === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">Nenhuma caixa registrada nesta ordem.</p>
      ) : (
        <div className="-mx-1 overflow-x-auto rounded-xl border border-border/80 sm:mx-0">
          <Table className="min-w-[640px] sm:min-w-0">
            <TableHeader>
              <TableRow className="border-b bg-muted/60 hover:bg-muted/60">
                <TableHead className="text-center font-semibold">Tipo / conteúdo</TableHead>
                <TableHead className="text-center font-semibold">Peso (kg)</TableHead>
                <TableHead className="text-center font-semibold">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordem.driverServiceOrderProducts.map((p, rowIdx) => (
                <TableRow key={p.id} className={rowIdx % 2 === 1 ? "bg-muted/20" : undefined}>
                  <TableCell className="text-center">{p.type}</TableCell>
                  <TableCell className="text-center">{Number(p.weight).toFixed(2)}</TableCell>
                  <TableCell className="text-center">{formatUsd(p.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="rounded-xl border border-border/80 bg-muted/15 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resumo por tipo (recibo)</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.entries(RECIBO_CATEGORY_LABEL).map(([k, label]) => (
            <li key={k} className="flex items-center justify-between gap-3 rounded-md bg-background/80 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums font-semibold">{summary[k as keyof typeof summary]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-border/60 pt-3 text-sm font-semibold">
          Total de unidades: <span className="tabular-nums text-[#1E3A5F]">{totalUnidades}</span>
        </p>
      </div>
    </div>
  );
}

