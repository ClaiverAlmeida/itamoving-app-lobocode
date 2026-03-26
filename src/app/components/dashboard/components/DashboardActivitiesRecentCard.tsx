import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Activity } from "lucide-react";
import { formatDateTimePtBR } from "../dashboard.utils";
import type { AtividadeRecente } from "../dashboard.constants";

export function DashboardActivitiesRecentCard({ atividadesRecentes }: { atividadesRecentes: AtividadeRecente[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Atividades Recentes
        </CardTitle>
        <CardDescription>Últimas atualizações do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[250px] overflow-y-auto">
          {atividadesRecentes.map((atividade) => {
            const Icon = atividade.icone;
            return (
              <motion.div key={atividade.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${
                    atividade.color === "blue"
                      ? "bg-blue-100"
                      : atividade.color === "green"
                        ? "bg-green-100"
                        : atividade.color === "purple"
                          ? "bg-purple-100"
                          : "bg-orange-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      atividade.color === "blue"
                        ? "text-blue-600"
                        : atividade.color === "green"
                          ? "text-green-600"
                          : atividade.color === "purple"
                            ? "text-purple-600"
                            : "text-orange-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium break-words">{atividade.descricao}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTimePtBR(atividade.data)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

