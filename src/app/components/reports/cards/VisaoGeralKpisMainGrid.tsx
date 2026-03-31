import React from "react";
import { ArrowUpRight, DollarSign, Ship, Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import type { EstatisticasGerais } from "../reports.payload";
import { formatPercentDelta } from "../reports.utils";

export function VisaoGeralKpisMainGrid(props: { estatisticas: EstatisticasGerais; formatCurrency: (value: number) => string }) {
  const { estatisticas, formatCurrency } = props;
  const receitasMoM = formatPercentDelta(estatisticas.crescimentoMensal);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Receitas</span>
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 break-words">
            {formatCurrency(estatisticas.receitas)}
          </p>
          <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 shrink-0" />
            <span>
              {receitasMoM} receitas <span className="text-blue-600/80">vs mês anterior</span>
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-900">Despesas</span>
          <TrendingDown className="w-5 h-5 text-red-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 break-words">
            {formatCurrency(estatisticas.despesas)}
          </p>
          <p className="text-xs text-red-700 mt-1">{estatisticas.totalTransacoes} transações</p>
        </CardContent>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-900">Lucro</span>
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 break-words">
            {formatCurrency(estatisticas.lucro)}
          </p>
          <p className="text-xs text-green-700 mt-1">Margem: {estatisticas.margemLucro}%</p>
        </CardContent>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-900">Clientes</span>
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">{estatisticas.totalClientes}</p>
          <p className="text-xs text-purple-700 mt-1">Total cadastrados</p>
        </CardContent>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-orange-900">Containers</span>
          <Ship className="w-5 h-5 text-orange-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">{estatisticas.totalContainers}</p>
          <div className="text-[10px] sm:text-xs text-orange-700 mt-1 space-y-0.5 leading-tight">
            <p>
              Prep. {estatisticas.containersPreparacao} · Env. {estatisticas.containersEnviado} · Trâns.{" "}
              {estatisticas.containersTransito}
            </p>
            <p>
              Entr. {estatisticas.containersEntregue} · Canc. {estatisticas.containersCancelados}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cyan-900">Ticket Médio</span>
          <Target className="w-5 h-5 text-cyan-600" />
        </div>
        <CardContent className="p-0">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-900 break-words">
            {formatCurrency(estatisticas.ticketMedio)}
          </p>
          <p className="text-xs text-cyan-700 mt-1">Por cliente</p>
        </CardContent>
      </Card>
    </div>
  );
}

