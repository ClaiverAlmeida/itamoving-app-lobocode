import React from "react";
import type { DriverServiceOrder } from "../../../api";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ContainerBoxItemsList } from "./ContainerBoxItemsList";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Boxes, Package, Scale, UserRound, Weight } from "lucide-react";

type Props = {
  order: DriverServiceOrder;
  previewLabels: string[];
};

function sumItemsWeight(
  items: NonNullable<DriverServiceOrder["driverServiceOrderProducts"][0]["driverServiceOrderProductsItems"]>,
): number {
  return items.reduce((s, it) => s + (it.weight ?? 0) * Math.max(1, it.quantity ?? 1), 0);
}

export function ServiceOrderBoxesPreview({ order, previewLabels }: Props) {
  const products = order.driverServiceOrderProducts ?? [];
  const pesoCaixas = products.reduce((s, p) => s + (p.weight ?? 0), 0);
  const pesoItensTotal = products.reduce(
    (s, p) => s + sumItemsWeight(p.driverServiceOrderProductsItems ?? []),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Package className="h-4 w-4 text-primary shrink-0" aria-hidden />
        Conteúdo da ordem (caixas e itens)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border/80 shadow-none bg-muted/40">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Boxes className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caixas</p>
                <p className="text-2xl font-semibold tabular-nums leading-tight">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-none bg-muted/40">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Weight className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peso das caixas</p>
                <p className="text-lg font-semibold tabular-nums leading-tight">
                  {pesoCaixas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-none bg-muted/40">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Scale className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Itens (peso × qtd)</p>
                <p className="text-lg font-semibold tabular-nums leading-tight">
                  {pesoItensTotal > 0
                    ? `${pesoItensTotal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">
            Cada linha é uma caixa da OS. A coluna à esquerda mostra como ficará a etiqueta no container.
          </p>
        </div>
        <div className="max-h-[min(40vh,320px)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-[120px] whitespace-nowrap font-semibold text-center">Etiqueta no container</TableHead>
                <TableHead className="w-[72px] font-semibold text-center">Ref. OS</TableHead>
                <TableHead className="w-[100px] font-semibold text-center">Tipo</TableHead>
                <TableHead className="text-center w-[100px] font-semibold">Peso (kg)</TableHead>
                <TableHead className="min-w-[220px] font-semibold text-left pl-4">Itens dentro da caixa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p, idx) => {
                const items = p.driverServiceOrderProductsItems ?? [];
                const label = previewLabels[idx] ?? "—";
                return (
                  <TableRow key={p.id ?? idx} className="align-top">
                    <TableCell className="font-mono text-sm font-medium text-primary text-center">
                      {label}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm text-center">
                      {p.number?.trim() ? p.number : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-center">{p.type}</TableCell>
                    <TableCell className="text-center tabular-nums text-sm">
                      {(p.weight ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm align-top pl-4 pr-2 py-3">
                      <ContainerBoxItemsList
                        items={items}
                        compact
                        emptyLabel="Sem itens listados"
                        className="max-w-md"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Card className="border-border/80 bg-muted/20">
        <CardHeader className="py-3 px-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Remetente e destinatário
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Remetente (EUA)</p>
              <p className="font-medium leading-snug">{order.sender.usaName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Destinatário (Brasil)</p>
              <p className="font-medium leading-snug">{order.recipient.brazilName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
