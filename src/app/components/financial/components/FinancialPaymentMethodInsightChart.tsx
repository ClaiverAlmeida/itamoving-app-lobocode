import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ChartEmpty } from "../../ui/chart-empty";
import type { PagamentoReceitaDespesaPoint } from "../index";

export function FinancialPaymentMethodInsightChart(props: {
  dados: PagamentoReceitaDespesaPoint[];
  formatCurrency: (value: number) => string;
}) {
  const { dados, formatCurrency } = props;
  const semDados = dados.length === 0 || dados.every((d) => (d.receitas ?? 0) === 0 && (d.despesas ?? 0) === 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Por método de pagamento</CardTitle>
        <CardDescription>Receitas e despesas comparadas por forma de pagamento</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {semDados ? (
          <ChartEmpty minHeightClass="min-h-[280px]" message="Sem movimentação por método de pagamento no filtro atual." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados} margin={{ top: 8, right: 8, left: 4, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="metodo"
                stroke="#64748B"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-28}
                textAnchor="end"
                height={56}
              />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="receitas" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
