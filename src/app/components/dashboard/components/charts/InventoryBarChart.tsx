import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import type { EstoqueDataPoint } from "../../dashboard.utils";

export function InventoryBarChart({ estoqueData }: { estoqueData: EstoqueDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário de Estoque</CardTitle>
        <CardDescription>Quantidade disponível por tipo</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

