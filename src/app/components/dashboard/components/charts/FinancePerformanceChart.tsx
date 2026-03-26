import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { TrendingUp } from "lucide-react";
import type { FinanceiroDataPoint } from "../../dashboard.utils";

export function FinancePerformanceChart({ financeiroData }: { financeiroData: FinanceiroDataPoint[] }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Financeira</CardTitle>
            <CardDescription>Receitas, despesas e lucro dos últimos 6 meses</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            +15.3%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={financeiroData}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
            />
            <Legend />
            <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={3} fill="url(#colorReceitas)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={3} fill="url(#colorDespesas)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="lucro" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorLucro)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

