import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { ChartEmpty } from "../../../ui/chart-empty";
import type { CategoriaReceitaDespesa } from "../../reports.payload";

export function DespesasPorCategoriaBarChart(props: {
  categoriasReceitaDespesa: CategoriaReceitaDespesa[];
  formatCurrency: (value: number) => string;
}) {
  const { categoriasReceitaDespesa, formatCurrency } = props;
  const semDados =
    categoriasReceitaDespesa.length === 0 ||
    categoriasReceitaDespesa.every((c) => (c.receitas ?? 0) === 0 && (c.despesas ?? 0) === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas e despesas por categoria</CardTitle>
        <CardDescription>Comparativo por categoria de transação</CardDescription>
      </CardHeader>
      <CardContent>
        {semDados ? (
          <ChartEmpty minHeightClass="min-h-[400px]" message="Sem receitas nem despesas por categoria para exibir." />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoriasReceitaDespesa}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="categoria" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
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
