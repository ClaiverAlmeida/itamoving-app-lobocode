import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ChartEmpty } from "../../ui/chart-empty";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { formatCurrencyUSD, type PagamentoReceitaDespesaPoint, type PieCategoriaPoint, type LineFluxoCaixaPoint } from "../index";
import { FinancialPaymentMethodInsightChart } from "./FinancialPaymentMethodInsightChart";

function temFluxoCaixa(data: LineFluxoCaixaPoint[]) {
  return data.some((p) => p.receitas !== 0 || p.despesas !== 0);
}

function temValoresPie(data: PieCategoriaPoint[]) {
  return data.some((p) => (p.value ?? 0) !== 0);
}

export function FinancialChartsSection(props: {
  fluxoCaixaMensal: LineFluxoCaixaPoint[];
  receitasPorCategoria: PieCategoriaPoint[];
  despesasPorCategoria: PieCategoriaPoint[];
  pagamentoReceitaDespesa: PagamentoReceitaDespesaPoint[];
  receitasCount: number;
  despesasCount: number;
}) {
  const {
    fluxoCaixaMensal,
    receitasPorCategoria,
    despesasPorCategoria,
    pagamentoReceitaDespesa,
    receitasCount,
    despesasCount,
  } = props;

  const mostrarFluxo = temFluxoCaixa(fluxoCaixaMensal);
  const mostrarReceitasPie = receitasCount > 0 && temValoresPie(receitasPorCategoria);
  const mostrarDespesasBar = despesasCount > 0 && temValoresPie(despesasPorCategoria);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Receitas vs Despesas - Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {!mostrarFluxo ? (
            <ChartEmpty minHeightClass="min-h-[280px]" message="Sem receitas ou despesas no período exibido." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fluxoCaixaMensal}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => formatCurrencyUSD(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={3} fill="url(#colorReceitas)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={3} fill="url(#colorDespesas)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Receitas por Categoria</CardTitle>
          <CardDescription>Distribuição de {receitasCount} receita(s)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {!mostrarReceitasPie ? (
            <ChartEmpty minHeightClass="min-h-[280px]" message="Sem receitas por categoria para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={receitasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    percent != null && percent > 0 ? `${String(name).slice(0, 10)}: ${(percent * 100).toFixed(0)}%` : ""
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {receitasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-receita-${index}`} fill={`hsl(${142 + index * 30}, 70%, ${50 + index * 5}%)`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => formatCurrencyUSD(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição de {despesasCount} despesa(s)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {!mostrarDespesasBar ? (
            <ChartEmpty minHeightClass="min-h-[280px]" message="Sem despesas por categoria para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={despesasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => formatCurrencyUSD(value)}
                />
                <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <FinancialPaymentMethodInsightChart dados={pagamentoReceitaDespesa} formatCurrency={formatCurrencyUSD} />
    </div>
  );
}
