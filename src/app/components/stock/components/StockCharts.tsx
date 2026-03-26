import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

type ChartDatum = { nome: string; atual: number; minimo: number; ideal: number; fill: string };
type DistributionDatum = { name: string; value: number; color: string };

export function StockCharts({
  chartData,
  distribuicaoData,
}: {
  chartData: ChartDatum[];
  distribuicaoData: DistributionDatum[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Estoque</CardTitle>
          <CardDescription>Comparativo com estoque mínimo e ideal</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="nome" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Bar dataKey="atual" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-atual-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Bar dataKey="minimo" fill="#94A3B8" radius={[8, 8, 0, 0]} />
              <Bar dataKey="ideal" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição do Estoque</CardTitle>
          <CardDescription>Proporção de itens por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {distribuicaoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

