import React from "react";
import { Calendar, Package, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import type { EstatisticasGerais } from "../reports.payload";

export function VisaoGeralInformativeCardsGrid(props: { estatisticas: EstatisticasGerais; quantidadeItensEstoque: number; estoqueTotal: number; estoqueBaixoCount: number; estoqueIdealCount: number }) {
  const { estatisticas, quantidadeItensEstoque, estoqueTotal, estoqueBaixoCount, estoqueIdealCount } = props;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Confirmados</span>
            <Badge className="bg-green-100 text-green-800">{estatisticas.agendamentosConfirmados}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Pendentes</span>
            <Badge className="bg-yellow-100 text-yellow-800">{estatisticas.agendamentosPendentes}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Concluídos</span>
            <Badge className="bg-blue-100 text-blue-800">{estatisticas.agendamentosConcluidos}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total de Itens</span>
            <Badge className="bg-green-100 text-green-800">{quantidadeItensEstoque}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Em Estoque</span>
            <Badge className="bg-blue-100 text-blue-800">{estoqueTotal}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Baixo Estoque</span>
            <Badge className="bg-orange-100 text-orange-800">{estoqueBaixoCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Estoque Ideal</span>
            <Badge className="bg-gray-100 text-gray-600">{estoqueIdealCount}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-purple-600" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Crescimento</span>
            <Badge className="bg-green-100 text-green-800">+{estatisticas.crescimentoMensal}%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Margem de Lucro</span>
            <Badge className="bg-blue-100 text-blue-800">{estatisticas.margemLucro}%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Taxa de Conversão</span>
            <Badge className="bg-purple-100 text-purple-800">87%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

