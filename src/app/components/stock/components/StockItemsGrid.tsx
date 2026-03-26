import React from "react";
import { motion } from "motion/react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { STOCK_ICON_BY_KEY } from "../stock.constants";
import type { StockItemConfig } from "../stock.types";
import { getNivelEstoque } from "../stock.utils";

export function StockItemsGrid({
  items,
  estoque,
}: {
  items: StockItemConfig[];
  estoque: Record<string, number>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const quantidade = Number(estoque[item.key] ?? 0);
        const nivel = getNivelEstoque(quantidade, item.minimo, item.ideal);
        const percentual = (quantidade / item.ideal) * 100;
        const Icon = STOCK_ICON_BY_KEY[item.key];
        return (
          <motion.div key={item.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="hover:shadow-lg transition-all border-l-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.nome}</CardTitle>
                <Icon className="h-5 w-5 text-slate-700" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{quantidade}</div>
                    <Badge className={nivel.color === "red" ? "bg-red-100 text-red-700" : nivel.color === "yellow" ? "bg-yellow-100 text-yellow-700" : nivel.color === "blue" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>{nivel.label}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mín: {item.minimo}</span>
                      <span>Ideal: {item.ideal}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(percentual, 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{percentual.toFixed(0)}% do ideal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

