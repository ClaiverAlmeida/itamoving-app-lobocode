import React from "react";
import { AlertCircle, BarChart3, Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { Card } from "../../ui/card";

type Stats = {
  total: number;
  pendentes: number;
  confirmados: number;
  coletados: number;
  hoje: number;
  amanha: number;
  atrasados: number;
};

type Props = {
  statistics: Stats;
};

export function AppointmentsMetricsCards({ statistics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      <Card className="p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-blue-900">Hoje</span>
          <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-blue-900">{statistics.hoje}</p>
        <p className="text-xs text-blue-700 mt-1">Agendamentos</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-purple-900">Amanhã</span>
          <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-purple-900">{statistics.amanha}</p>
        <p className="text-xs text-purple-700 mt-1">Programados</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-yellow-900">Pendentes</span>
          <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-yellow-900">{statistics.pendentes}</p>
        <p className="text-xs text-yellow-700 mt-1">Aguardando</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-green-900">Confirmados</span>
          <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-green-900">{statistics.confirmados}</p>
        <p className="text-xs text-green-700 mt-1">Prontos</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-red-900">Atrasados</span>
          <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-red-900">{statistics.atrasados}</p>
        <p className="text-xs text-red-700 mt-1">Urgente</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-slate-900">Total</span>
          <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900">{statistics.total}</p>
        <p className="text-xs text-slate-700 mt-1">Agendamentos</p>
      </Card>
    </div>
  );
}
