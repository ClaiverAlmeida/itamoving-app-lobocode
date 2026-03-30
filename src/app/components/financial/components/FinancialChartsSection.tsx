import React from "react";
import { Activity, PieChart as PieChartIcon, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { formatCurrencyUSD, groupTransacoesByCategoria, type PieCategoriaPoint, type LineFluxoCaixaPoint } from "../index";
export function FinancialChartsSection(props: {
  fluxoCaixaMensal: LineFluxoCaixaPoint[];
  receitasPorCategoria: PieCategoriaPoint[];
  despesasPorCategoria: PieCategoriaPoint[];
  receitasCount: number;
  despesasCount: number;
}) {
  const { fluxoCaixaMensal, receitasPorCategoria, despesasPorCategoria, receitasCount, despesasCount } = props;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Receitas vs Despesas - Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
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
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} formatter={(value: number) => formatCurrencyUSD(value)} />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={3} fill="url(#colorReceitas)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={3} fill="url(#colorDespesas)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Receitas por Categoria</CardTitle>
          <CardDescription>Distribuição de {receitasCount} receita(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={receitasPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) =>
                  percent > 0 ? `${String(name).slice(0, 10)}: ${(percent * 100).toFixed(0)}%` : ""
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {receitasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-receita-${index}`} fill={`hsl(${142 + index * 30}, 70%, ${50 + index * 5}%)`} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} formatter={(value: number) => formatCurrencyUSD(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição de {despesasCount} despesa(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={despesasPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" />
              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} formatter={(value: number) => formatCurrencyUSD(value)} />
              <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

