import React from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import type { PerformanceAtendente } from "../reports.payload";

export function AtendimentoPerformanceRankingList(props: { performanceAtendentes: PerformanceAtendente[]; formatCurrency: (value: number) => string }) {
  const { performanceAtendentes, formatCurrency } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Atendente</CardTitle>
        <CardDescription>Ranking de atendentes por receitas geradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performanceAtendentes.map((atendente, index) => (
            <Card key={atendente.nome} className="bg-slate-50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                            ? "bg-gray-400"
                            : index === 2
                              ? "bg-orange-600"
                              : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold break-words">{atendente.nome}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {atendente.clientes} clientes
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Ticket: {formatCurrency(atendente.ticketMedio)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">{formatCurrency(atendente.receitas)}</p>
                    <p className="text-xs text-muted-foreground">Total em receitas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

