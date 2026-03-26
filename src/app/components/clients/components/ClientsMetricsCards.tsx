import React from 'react';
import { Card } from '../../ui/card';
import { Building, Flag, TrendingUp, Users as UsersIcon } from 'lucide-react';

type Props = {
  statistics: {
    total: number;
    novosUltimaSemana: number;
    estadosUnicos: number;
    cidadesBrasilUnicas: number;
  };
};

export function ClientsMetricsCards({ statistics }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <Card className="p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-blue-900">Total de Clientes</span>
          <UsersIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-blue-900">{statistics.total}</p>
        <p className="text-xs text-blue-700 mt-1">Cadastros ativos</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-green-900">Novos (7 dias)</span>
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-green-900">{statistics.novosUltimaSemana}</p>
        <p className="text-xs text-green-700 mt-1">Última semana</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-purple-900">Estados (USA)</span>
          <Building className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-purple-900">{statistics.estadosUnicos}</p>
        <p className="text-xs text-purple-700 mt-1">Localizações únicas</p>
      </Card>

      <Card className="p-4 lg:p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-orange-900">Cidades (BR)</span>
          <Flag className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-orange-900">{statistics.cidadesBrasilUnicas}</p>
        <p className="text-xs text-orange-700 mt-1">Destinos no Brasil</p>
      </Card>
    </div>
  );
}
