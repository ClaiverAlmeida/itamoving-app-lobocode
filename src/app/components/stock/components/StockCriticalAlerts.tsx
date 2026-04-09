import React from "react";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import type { ItemKeyEn, StockItemConfig } from "../stock.types";
import { getNivelEstoque } from "../stock.utils";

export function StockCriticalAlerts({
  items,
  estoque,
  onRepor,
}: {
  items: StockItemConfig[];
  estoque: Record<string, number>;
  onRepor: (itemKey: ItemKeyEn) => void;
}) {
  const hasCritical = items.some((item) => getNivelEstoque(Number(estoque[item.key] ?? 0), item.minimo, item.ideal).nivel === "critico");
  if (!hasCritical) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-red-500 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Alertas Críticos</CardTitle>
          </div>
          <CardDescription className="text-red-700">Itens que necessitam reposição urgente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => {
              const quantidade = Number(estoque[item.key] ?? 0);
              const nivel = getNivelEstoque(quantidade, item.minimo, item.ideal);
              if (nivel.nivel !== "critico") return null;
              const faltam = item.ideal - quantidade;
              return (
                <div key={item.key} className="flex flex-col gap-3 rounded-lg border border-red-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-red-900 break-words">{item.nome}</p>
                    <p className="text-sm text-red-700 break-words">Estoque: {quantidade} | Mínimo: {item.minimo} | Faltam: {faltam}</p>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto" onClick={() => onRepor(item.key)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Repor
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

