import React, { useMemo } from "react";
import { CheckCircle, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { formatUsdValorRecebidoLivre } from "../../delivery-receipt/delivery-receipt-utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { round2 } from "../service-order-form.payment";

type Props = {
  valorTotalCaixas: number;
  valorAgendamento?: number;
  valorAntecipacao?: number;
  paymentPoolUsd: number;
  cashUsd: number;
  setCashUsd: (v: number) => void;
};

export function ServiceOrderFormPaymentCard({
  valorTotalCaixas,
  valorAgendamento = 0,
  valorAntecipacao = 0,
  paymentPoolUsd,
  cashUsd,
  setCashUsd,
}: Props) {
  const subtotalAgendamento = Math.max(valorAgendamento - valorAntecipacao, 0);
  const pool = round2(Math.max(0, paymentPoolUsd));
  const cash = round2(Math.min(Math.max(cashUsd, 0), pool));
  const zelle = round2(pool - cash);

  const maxCents = useMemo(() => Math.max(0, Math.round(pool * 100)), [pool]);
  const cashCents = Math.round(cash * 100);
  const zelleCents = Math.max(0, maxCents - cashCents);

  const setCashFromCents = (cents: number) => {
    const c = Math.max(0, Math.min(cents, maxCents));
    setCashUsd(round2(c / 100));
  };

  const totalConsolidado = subtotalAgendamento + valorTotalCaixas;

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
              <span className="text-sm text-muted-foreground">Valor total dos volumes:</span>
              <span className="text-2xl font-bold text-green-700">$ {valorTotalCaixas.toFixed(2)}</span>
            </div>

            <div className="border-t border-green-200 pt-4 space-y-4">
              <p className="text-sm font-semibold text-green-900">
                Total da ordem (base do repasse): <span className="tabular-nums">$ {pool.toFixed(2)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Indique quanto foi recebido em espécie e via Zelle. Os valores são complementares sobre o total da ordem (não se somam um ao outro).
              </p>

              {pool <= 0 ? (
                <p className="text-sm text-muted-foreground">Sem valor de ordem para repartir (ajuste agendamento e volumes).</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm gap-2">
                      <Label htmlFor="range-cash" className="text-foreground font-medium">
                        Em espécie
                      </Label>
                      <span className="font-semibold tabular-nums text-green-800">$ {cash.toFixed(2)}</span>
                    </div>
                    <input
                      id="range-cash"
                      type="range"
                      className="w-full h-2 accent-green-600 rounded-lg appearance-none cursor-pointer bg-green-200/80"
                      min={0}
                      max={maxCents}
                      step={1}
                      value={cashCents}
                      onChange={(e) => setCashFromCents(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm gap-2">
                      <Label htmlFor="range-zelle" className="text-foreground font-medium">
                        Zelle
                      </Label>
                      <span className="font-semibold tabular-nums text-green-800">$ {zelle.toFixed(2)}</span>
                    </div>
                    <input
                      id="range-zelle"
                      type="range"
                      className="w-full h-2 accent-emerald-600 rounded-lg appearance-none cursor-pointer bg-emerald-200/80"
                      min={0}
                      max={maxCents}
                      step={1}
                      value={zelleCents}
                      onChange={(e) => setCashFromCents(maxCents - Number(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-green-300 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total consolidado</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal agendamento</span>
                <span className="font-medium tabular-nums">$ {subtotalAgendamento.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">+ Total dos volumes</span>
                <span className="font-medium tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="text-base font-bold">Total geral</span>
                <span className="text-xl font-bold text-green-800 tabular-nums">$ {totalConsolidado.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {pool > 0 && (cash > 0 || zelle > 0) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">Repartição registrada</p>
                <p className="text-xs text-blue-700">
                  Espécie: $ {formatUsdValorRecebidoLivre(cash)} · Zelle: $ {formatUsdValorRecebidoLivre(zelle)}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
