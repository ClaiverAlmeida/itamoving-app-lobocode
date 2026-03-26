import React from "react";
import { Card } from "../../ui/card";
import { BarChart3, DollarSign, TrendingDown, TrendingUp, Users as UsersIcon } from "lucide-react";
import type { LeadsStatistics } from "../services.types";
import { formatCurrency } from "../services.utils";

export function ServicesMetricsCards({ statistics }: { statistics: LeadsStatistics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-blue-900">Total de Leads</span>
          <UsersIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">{statistics.total}</p>
        <p className="text-xs text-blue-700 mt-1">Todos os status</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-green-900">Valor Total</span>
          <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 break-words">{formatCurrency(statistics.totalValor)}</p>
        <p className="text-xs text-green-700 mt-1">Pipeline completo</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-purple-900">Taxa de Conversão</span>
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">{statistics.taxaConversao.toFixed(1)}%</p>
        <p className="text-xs text-purple-700 mt-1">Leads fechados</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-orange-900">Ticket Médio</span>
          <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 break-words">{formatCurrency(statistics.ticketMedio)}</p>
        <p className="text-xs text-orange-700 mt-1">Valor médio/lead</p>
      </Card>
    </div>
  );
}

