import React from "react";
import { Clock, TrendingUp, Truck } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";

export function DashboardSecondaryKpiCardsSection({
  containersAtivos,
  containersEmTransito,
}: {
  containersAtivos: number;
  containersEmTransito: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-900">Containers Ativos</p>
              <p className="text-2xl font-bold text-cyan-900 mt-1">{containersAtivos}</p>
              <p className="text-xs text-cyan-700 mt-1">{containersEmTransito} em trânsito</p>
            </div>
            <Truck className="w-10 h-10 text-cyan-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-900">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">87.5%</p>
              <p className="text-xs text-indigo-700 mt-1">Leads para clientes</p>
            </div>
            <TrendingUp className="w-10 h-10 text-indigo-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-900">Tempo Médio</p>
              <p className="text-2xl font-bold text-pink-900 mt-1">4-6 sem</p>
              <p className="text-xs text-pink-700 mt-1">Entrega porta a porta</p>
            </div>
            <Clock className="w-10 h-10 text-pink-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

