import React from "react";
import { Download } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { EstatisticasGerais } from "../reports.payload";

export function OperacionalContainersCardsGrid(props: { estatisticas: EstatisticasGerais; onExport: (tipo: string) => void }) {
  const { estatisticas, onExport } = props;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Total Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-blue-900">{estatisticas.totalContainers}</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onExport("containers")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg">Em Preparação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-yellow-900">{estatisticas.containersPreparacao}</p>
          <p className="text-sm text-yellow-700 mt-2">Sendo carregados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg">Em Trânsito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-purple-900">{estatisticas.containersTransito}</p>
          <p className="text-sm text-purple-700 mt-2">No oceano</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg">Entregues</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-900">{estatisticas.containersEntregue}</p>
          <p className="text-sm text-green-700 mt-2">Completos</p>
        </CardContent>
      </Card>
    </div>
  );
}

