import React from "react";
import { Activity, DollarSign, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import type { FinanceiroTotals } from "../index";
import { formatCurrencyUSD } from "../index";

export function FinancialMetricsCards(props: {
  totals: FinanceiroTotals;
  filteredCount: number;
}) {
  const { totals, filteredCount } = props;
  const { totalReceitas, totalDespesas, lucro, margemLucro, ticketMedio, receitas, despesas } = totals;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
      <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-green-900">Receitas</span>
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-2xl lg:text-3xl font-bold text-green-900">{formatCurrencyUSD(totalReceitas)}</p>
          <p className="text-xs text-green-700 mt-1">{receitas.length} transação(ões)</p>
        </CardContent>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-red-900">Despesas</span>
          <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-2xl lg:text-3xl font-bold text-red-900">{formatCurrencyUSD(totalDespesas)}</p>
          <p className="text-xs text-red-700 mt-1">{despesas.length} transação(ões)</p>
        </CardContent>
      </Card>

      <Card
        className={`p-4 lg:p-5 bg-gradient-to-br border-2 ${
          lucro >= 0 ? "from-blue-50 to-blue-100 border-blue-200" : "from-orange-50 to-orange-100 border-orange-200"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs lg:text-sm font-medium ${lucro >= 0 ? "text-blue-900" : "text-orange-900"}`}>Lucro Líquido</span>
          <DollarSign className={`w-4 h-4 lg:w-5 lg:h-5 ${lucro >= 0 ? "text-blue-600" : "text-orange-600"}`} />
        </div>
        <CardContent className="p-0">
          <p className={`text-2xl lg:text-3xl font-bold ${lucro >= 0 ? "text-blue-900" : "text-orange-900"}`}>{formatCurrencyUSD(lucro)}</p>
          <p className={`text-xs mt-1 ${lucro >= 0 ? "text-blue-700" : "text-orange-700"}`}>Margem: {margemLucro}%</p>
        </CardContent>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-purple-900">Ticket Médio</span>
          <Target className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-2xl lg:text-3xl font-bold text-purple-900">{formatCurrencyUSD(ticketMedio)}</p>
          <p className="text-xs text-purple-700 mt-1">Por transação</p>
        </CardContent>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-cyan-900">Total</span>
          <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-2xl lg:text-3xl font-bold text-cyan-900">{filteredCount}</p>
          <p className="text-xs text-cyan-700 mt-1">Transações</p>
        </CardContent>
      </Card>
    </div>
  );
}

