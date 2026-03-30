import React from "react";
import { Download } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { EstatisticasGerais } from "../reports.payload";
import type { FinancialTransaction } from "../../../api";

export function FinanceTotalsCards(props: {
  estatisticas: EstatisticasGerais;
  transacoes: FinancialTransaction[];
  formatCurrency: (value: number) => string;
  onExport: (tipo: string) => void;
}) {
  const { estatisticas, transacoes, formatCurrency, onExport } = props;

  const totalReceitasTx = transacoes.filter((t) => t.tipo === "receita").length;
  const totalDespesasTx = transacoes.filter((t) => t.tipo === "despesa").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg">Total de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(estatisticas.receitas)}</p>
          <p className="text-sm text-green-700 mt-2">{totalReceitasTx} transação(ões)</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onExport("receitas")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg">Total de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-900">{formatCurrency(estatisticas.despesas)}</p>
          <p className="text-sm text-red-700 mt-2">{totalDespesasTx} transação(ões)</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onExport("despesas")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 border-2">
        <CardHeader>
          <CardTitle className="text-lg">Lucro Líquido</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(estatisticas.lucro)}</p>
          <p className="text-sm text-blue-700 mt-2">Margem de {estatisticas.margemLucro}%</p>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onExport("lucro")}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

