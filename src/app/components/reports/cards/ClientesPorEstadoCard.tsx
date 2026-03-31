import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ChartEmpty } from "../../ui/chart-empty";
import type { ClientePorEstado } from "../reports.payload";

export function ClientesPorEstadoCard(props: { clientesPorEstado: ClientePorEstado[] }) {
  const { clientesPorEstado } = props;
  const semDados = clientesPorEstado.length === 0 || clientesPorEstado.every((c) => (c.quantidade ?? 0) === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes por Estado (USA)</CardTitle>
        <CardDescription>Top 10 estados de origem</CardDescription>
      </CardHeader>
      <CardContent>
        {semDados ? (
          <ChartEmpty minHeightClass="min-h-[400px]" message="Sem clientes por estado para exibir." />
        ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={clientesPorEstado} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" stroke="#64748B" />
            <YAxis dataKey="estado" type="category" stroke="#64748B" width={50} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="quantidade" fill="#3B82F6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

