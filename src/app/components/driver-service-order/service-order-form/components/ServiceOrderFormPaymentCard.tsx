import React from "react";
import { CheckCircle, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

type Props = {
  valorTotalCaixas: number;
  valorAgendamento?: number;
  valorAntecipacao?: number;
  valorPago: string;
  setValorPago: (v: string) => void;
};

export function ServiceOrderFormPaymentCard({
  valorTotalCaixas,
  valorAgendamento = 0,
  valorAntecipacao = 0,
  valorPago,
  setValorPago,
}: Props) {
  const subtotalAgendamento = Math.max(valorAgendamento - valorAntecipacao, 0);
  const valorRecebidoNum = (() => {
    const n = parseFloat(String(valorPago).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();
  const totalConsolidado =
    subtotalAgendamento + valorTotalCaixas + valorRecebidoNum;

  return (
    <Card className="border-2 border-green-500">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg border-0">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valor do Agendamento:</span>
                <span className="font-semibold">$ {valorAgendamento.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Antecipação:</span>
                <span className="font-semibold">- $ {valorAntecipacao.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-green-200">
                <span className="font-semibold text-muted-foreground">Subtotal (Agendamento - Antecipação):</span>
                <span className="font-bold text-green-700">$ {subtotalAgendamento.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <span className="text-sm text-muted-foreground">Valor Total das Caixas:</span>
              <span className="text-2xl font-bold text-green-700">$ {valorTotalCaixas.toFixed(2)}</span>
            </div>
            <div className="border-t border-green-200 pt-4">
              <Label htmlFor="valorPago" className="text-base font-semibold mb-2 block">Valor recebido em espécie ou Zelle</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  id="valorPago"
                  type="number"
                  placeholder="0.00"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="pl-10 text-lg font-semibold h-12 border-green-300 focus:border-green-500"
                  step="0.01"
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-green-300 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total consolidado
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal agendamento</span>
                <span className="font-medium tabular-nums">$ {subtotalAgendamento.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">+ Total das caixas</span>
                <span className="font-medium tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">+ Valor recebido</span>
                <span className="font-medium tabular-nums">$ {valorRecebidoNum.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="text-base font-bold">Total geral</span>
                <span className="text-xl font-bold text-green-800 tabular-nums">
                  $ {totalConsolidado.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {valorPago && parseFloat(valorPago) > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Pagamento registrado</p>
                <p className="text-xs text-blue-700">$ {parseFloat(valorPago).toFixed(2)} em espécie</p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

