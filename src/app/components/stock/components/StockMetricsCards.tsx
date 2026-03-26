import React from "react";
import { AlertTriangle, Boxes, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";
import type { StockStatistics } from "../stock.types";

export function StockMetricsCards({ statistics }: { statistics: StockStatistics }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 lg:p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-blue-900 lg:text-sm">Total de Itens</span>
          <Boxes className="h-4 w-4 text-blue-600 lg:h-5 lg:w-5" />
        </div>
        <p className="text-2xl font-bold text-blue-900 lg:text-3xl">{statistics.totalItens}</p>
      </Card>
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 lg:p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-red-900 lg:text-sm">Críticos</span>
          <AlertTriangle className="h-4 w-4 text-red-600 lg:h-5 lg:w-5" />
        </div>
        <p className="text-2xl font-bold text-red-900 lg:text-3xl">{statistics.itensCriticos}</p>
      </Card>
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 lg:p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-green-900 lg:text-sm">Ideais</span>
          <CheckCircle2 className="h-4 w-4 text-green-600 lg:h-5 lg:w-5" />
        </div>
        <p className="text-2xl font-bold text-green-900 lg:text-3xl">{statistics.itensOk}</p>
      </Card>
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 lg:p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-purple-900 lg:text-sm">Entradas (7d)</span>
          <TrendingUp className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
        </div>
        <p className="text-2xl font-bold text-purple-900 lg:text-3xl">{statistics.entradas7dias}</p>
      </Card>
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4 lg:p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-orange-900 lg:text-sm">Saídas (7d)</span>
          <TrendingDown className="h-4 w-4 text-orange-600 lg:h-5 lg:w-5" />
        </div>
        <p className="text-2xl font-bold text-orange-900 lg:text-3xl">{statistics.saidas7dias}</p>
      </Card>
    </div>
  );
}

