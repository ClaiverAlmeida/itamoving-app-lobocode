import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import type { PerformanceDataPoint } from "../../dashboard.utils";
import { ChartEmpty } from "../../../ui/chart-empty";

function temAtividadeSemanal(data: PerformanceDataPoint[]) {
  return data.some((p) => p.clientes > 0 || p.agendamentos > 0 || p.containers > 0);
}

export function WeeklyPerformanceBarChart({ performanceData }: { performanceData: PerformanceDataPoint[] }) {
  const semDados = !temAtividadeSemanal(performanceData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Semanal</CardTitle>
        <CardDescription>Atividades dos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        {semDados ? (
          <ChartEmpty message="Sem atividades nos últimos 7 dias." />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="dia" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Bar dataKey="clientes" fill="#5DADE2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="agendamentos" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="containers" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

