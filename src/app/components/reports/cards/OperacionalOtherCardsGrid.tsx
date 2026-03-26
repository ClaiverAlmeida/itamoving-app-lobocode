import React from "react";
import { Download } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { EstatisticasGerais } from "../reports.payload";

export function OperacionalOtherCardsGrid(props: {
  estatisticas: EstatisticasGerais;
  quantidadeItensEstoque: number;
  estoqueBaixoCount: number;
  estoqueIdealCount: number;
  onExport: (tipo: string) => void;
}) {
  const { estatisticas, quantidadeItensEstoque, estoqueBaixoCount, estoqueIdealCount, onExport } = props;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
        <CardHeader>
          <CardTitle className="text-lg">Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-cyan-900">{estatisticas.totalAgendamentos}</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onExport("agendamentos")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg">Itens de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-orange-900">{quantidadeItensEstoque}</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onExport("estoque")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
        <CardHeader>
          <CardTitle className="text-lg">Baixo Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-pink-900">{estoqueBaixoCount}</p>
          <p className="text-sm text-pink-700 mt-2">Necessitam reposição</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-50 to-green-100 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Estoque Ideal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-gray-600">{estoqueIdealCount}</p>
          <p className="text-sm text-gray-600 mt-2">Dentro do estoque ideal</p>
        </CardContent>
      </Card>
    </div>
  );
}

