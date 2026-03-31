import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { ChartEmpty } from "../../../ui/chart-empty";
import type { ReceitaMensal } from "../../reports.payload";

export function ReceitasMensaisAreaChart(props: {
  receitasMensais: ReceitaMensal[];
  formatCurrency: (value: number) => string;
}) {
  const { receitasMensais, formatCurrency } = props;
  const semDados = receitasMensais.length === 0 || receitasMensais.every((r) => (r.valor ?? 0) === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas Mensais</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {semDados ? (
          <ChartEmpty minHeightClass="min-h-[300px]" message="Sem receitas nos meses exibidos." />
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={receitasMensais}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
              formatter={(value: number) => formatCurrency(value)}
            />
            <Area type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={3} fill="url(#colorReceitas)" />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

