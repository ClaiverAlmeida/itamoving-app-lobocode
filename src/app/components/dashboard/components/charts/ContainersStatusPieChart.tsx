import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "../../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import type { ContainerStatusDataPoint } from "../../dashboard.utils";
import { ChartEmpty } from "../../../ui/chart-empty";

export function ContainersStatusPieChart({
  containersStatusData,
  containersAtivos,
  containersCount,
}: {
  containersStatusData: ContainerStatusDataPoint[];
  containersAtivos: number;
  containersCount: number;
}) {
  const totalNoGrafico = containersStatusData.reduce((s, d) => s + d.value, 0);
  const semDados = totalNoGrafico === 0;
  const mensagemVazio =
    containersCount === 0 ? "Nenhum container cadastrado." : "Nenhum container nesses status no momento.";

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Status dos Containers</CardTitle>
            <CardDescription>Distribuição atual dos {containersCount} containers</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            {containersAtivos} ativos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {semDados ? (
          <ChartEmpty minHeightClass="min-h-[280px]" message={mensagemVazio} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={containersStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => (percent && percent > 0 ? `${String(name).slice(0, 10)}: ${(percent * 100).toFixed(0)}%` : "")}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
              >
                {containersStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

