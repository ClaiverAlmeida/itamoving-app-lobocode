import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import type { Alerta, View } from "../dashboard.constants";
import { getAlertaColor } from "../dashboard.utils";

export function DashboardAlertsSection({
  alertas,
  onNavigate,
}: {
  alertas: Alerta[];
  onNavigate?: (view: View) => void;
}) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alertas.map((alerta) => {
          const colors = getAlertaColor(alerta.tipo);
          const Icon = alerta.icone;
          return (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className={`${colors.bg} ${colors.border} border-l-4`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className={`p-2 rounded-full ${colors.bg}`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${colors.text}`}>{alerta.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => onNavigate?.(alerta.navigateTo!)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

