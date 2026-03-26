import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";

export function ContainersStatusPieChart(props: { containersPreparacao: number; containersTransito: number; containersEntregue: number }) {
  const { containersPreparacao, containersTransito, containersEntregue } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Containers</CardTitle>
        <CardDescription>Distribuição por status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Em Preparação", value: containersPreparacao },
                { name: "Em Trânsito", value: containersTransito },
                { name: "Entregue", value: containersEntregue },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) =>
                percent && percent > 0 ? `${String(name).slice(0, 10)}: ${(percent * 100).toFixed(0)}%` : ""
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="#F59E0B" />
              <Cell fill="#3B82F6" />
              <Cell fill="#10B981" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

