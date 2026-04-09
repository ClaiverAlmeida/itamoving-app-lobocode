import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import type { EstoqueDataPoint } from "../../dashboard.utils";
import { ChartEmpty } from "../../../ui/chart-empty";

export function InventoryBarChart({ estoqueData }: { estoqueData: EstoqueDataPoint[] }) {
  const semDados = estoqueData.every((e) => (e.quantidade ?? 0) === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário de Estoque</CardTitle>
        <CardDescription>Quantidade disponível por tipo</CardDescription>
      </CardHeader>
      <CardContent>
        {semDados ? (
          <ChartEmpty message="Estoque sem quantidades registradas." />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={estoqueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="tipo" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="quantidade" radius={[8, 8, 0, 0]} animationDuration={1500}>
                {estoqueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
