import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { ChartEmpty } from "../../../ui/chart-empty";

type Props = {
  containersPreparacao: number;
  containersEnviado: number;
  containersTransito: number;
  containersEntregue: number;
  containersCancelados: number;
};

const SEGMENTS: { key: keyof Props; name: string; fill: string }[] = [
  { key: "containersPreparacao", name: "Em Preparação", fill: "#F59E0B" },
  { key: "containersEnviado", name: "Enviado", fill: "#6366F1" },
  { key: "containersTransito", name: "Em Trânsito", fill: "#3B82F6" },
  { key: "containersEntregue", name: "Entregue", fill: "#10B981" },
  { key: "containersCancelados", name: "Cancelado", fill: "#EF4444" },
];

export function ContainersStatusPieChart(props: Props) {
  const total =
    props.containersPreparacao +
    props.containersEnviado +
    props.containersTransito +
    props.containersEntregue +
    props.containersCancelados;

  const pieData = SEGMENTS.map((s) => ({
    name: s.name,
    value: props[s.key],
    fill: s.fill,
  })).filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Containers</CardTitle>
        <CardDescription>Distribuição por status</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <ChartEmpty minHeightClass="min-h-[300px]" message="Nenhum container na base." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  percent && percent > 0 ? `${String(name).slice(0, 12)}: ${(percent * 100).toFixed(0)}%` : ""
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
