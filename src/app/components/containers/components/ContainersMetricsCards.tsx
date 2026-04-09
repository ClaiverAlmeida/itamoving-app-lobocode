import React from "react";
import { Card } from "../../ui/card";
import {
  Boxes,
  CheckCircle2,
  Container as ContainerIcon,
  Package,
  Ship,
  Weight,
} from "lucide-react";

type Props = {
  statistics: {
    total: number;
    emPreparacao: number;
    emTransito: number;
    entregues: number;
  };
};

export function ContainersMetricsCards({ statistics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-blue-900">
            Total Containers
          </span>
          <ContainerIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">
          {statistics.total}
        </p>
        <p className="text-xs text-blue-700 mt-1">Containers ativos</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-yellow-900">
            Em Preparação
          </span>
          <Package className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">
          {statistics.emPreparacao}
        </p>
        <p className="text-xs text-yellow-700 mt-1">Sendo carregados</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-purple-900">
            Em Trânsito
          </span>
          <Ship className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">
          {statistics.emTransito}
        </p>
        <p className="text-xs text-purple-700 mt-1">No oceano</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-green-900">
            Entregues
          </span>
          <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">
          {statistics.entregues}
        </p>
        <p className="text-xs text-green-700 mt-1">Completos</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-orange-900">
            Total volumes
          </span>
          <Boxes className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
        </div>
        <p className="text-xs text-orange-700 mt-1">Unidades</p>
      </Card>

      <Card className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-slate-900">
            Peso Total
          </span>
          <Weight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
        </div>
        <p className="text-xs text-slate-700 mt-1">Quilogramas</p>
      </Card>
    </div>
  );
}

