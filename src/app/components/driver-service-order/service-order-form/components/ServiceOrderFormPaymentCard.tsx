import React from "react";
import { CheckCircle, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { formatUsdValorRecebidoLivre } from "../../delivery-receipt/delivery-receipt-utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { round2 } from "../service-order-form.payment";

type Props = {
  valorTotalCaixas: number;
  /** Discriminação opcional (volumes vs frete) — mesma base que `valorTotalCaixas`. */
  valorSubtotalVolumes?: number;
  valorSubtotalFrete?: number;
  temFrete?: boolean;
  valorAgendamento?: number;
  valorAntecipacao?: number;
  paymentPoolUsd: number;
  totalReceivedUsd: number;
  setTotalReceivedUsd: (v: number) => void;
  cashUsd: number;
  setCashUsd: (v: number) => void;
};

export function ServiceOrderFormPaymentCard({
  valorTotalCaixas,
  valorSubtotalVolumes,
  valorSubtotalFrete = 0,
  temFrete = false,
  valorAgendamento = 0,
  valorAntecipacao = 0,
  paymentPoolUsd,
  totalReceivedUsd,
  setTotalReceivedUsd,
  cashUsd,
  setCashUsd,
}: Props) {
  const clampMoney = (n: number, min: number, max: number) => round2(Math.min(Math.max(n, min), max));
  const subtotalAgendamento = Math.max(valorAgendamento - valorAntecipacao, 0);
  const pool = round2(Math.max(0, paymentPoolUsd));
  const totalReceived = round2(Math.min(Math.max(totalReceivedUsd, 0), pool));
  const cash = round2(Math.min(Math.max(cashUsd, 0), totalReceived));
  const zelle = round2(totalReceived - cash);
  const pendente = round2(Math.max(0, pool - totalReceived));
  const onCashChange = (raw: string) => {
    const input = Number(raw);
    const parsed = Number.isFinite(input) ? input : 0;
    const nextCash = clampMoney(parsed, 0, pool);
    const allowedCash = clampMoney(nextCash, 0, pool - zelle);
    setCashUsd(allowedCash);
    setTotalReceivedUsd(round2(allowedCash + zelle));
  };

  const onZelleChange = (raw: string) => {
    const input = Number(raw);
    const parsed = Number.isFinite(input) ? input : 0;
    const nextZelle = clampMoney(parsed, 0, pool);
    const allowedZelle = clampMoney(nextZelle, 0, pool - cash);
    setTotalReceivedUsd(round2(cash + allowedZelle));
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
            <div className="flex flex-col gap-2 mb-4">
              {temFrete && valorSubtotalVolumes != null ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Volumes e produtos (sem frete):</span>
                    <span className="text-xl font-bold text-green-700 tabular-nums">$ {valorSubtotalVolumes.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Frete:</span>
                    <span className="text-xl font-bold text-green-700 tabular-nums">$ {valorSubtotalFrete.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-green-200">
                    <span className="text-sm font-semibold text-muted-foreground">Total produtos + frete:</span>
                    <span className="text-2xl font-bold text-green-800 tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Valor total dos volumes:</span>
                  <span className="text-2xl font-bold text-green-700">$ {valorTotalCaixas.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-green-200 pt-4 space-y-4">
              <p className="text-sm font-semibold text-green-900">
                Total da ordem (base do repasse): <span className="tabular-nums">$ {pool.toFixed(2)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Informe os valores pagos agora em espécie e Zelle. A soma não pode ultrapassar o total da ordem.
              </p>

              {pool <= 0 ? (
                <p className="text-sm text-muted-foreground">Sem valor de ordem para repartir (ajuste agendamento e volumes).</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="input-cash" className="text-foreground font-medium">
                        Em espécie
                      </Label>
                      <input
                        id="input-cash"
                        type="number"
                        inputMode="decimal"
                        className="w-full rounded-md border-2 border-green-500 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        min={0}
                        max={pool}
                        step="0.01"
                        value={cash}
                        onChange={(e) => onCashChange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-zelle" className="text-foreground font-medium">
                        Zelle
                      </Label>
                      <input
                        id="input-zelle"
                        type="number"
                        inputMode="decimal"
                        className="w-full rounded-md border-2 border-green-500 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        min={0}
                        max={pool}
                        step="0.01"
                        value={zelle}
                        onChange={(e) => onZelleChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Total pago agora: <span className="font-semibold">$ {totalReceived.toFixed(2)}</span> de $ {pool.toFixed(2)}
                  </div>

                  {pendente > 0.005 && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <span className="font-semibold">Saldo pendente: </span>
                      <span className="tabular-nums">$ {pendente.toFixed(2)}</span>
                    </div>
                  )}

                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-green-300 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total consolidado</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal agendamento</span>
                <span className="font-medium tabular-nums">$ {subtotalAgendamento.toFixed(2)}</span>
              </div>
              {temFrete && valorSubtotalVolumes != null ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">+ Volumes e produtos</span>
                    <span className="font-medium tabular-nums">$ {valorSubtotalVolumes.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">+ Frete</span>
                    <span className="font-medium tabular-nums">$ {valorSubtotalFrete.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">+ Total dos volumes</span>
                  <span className="font-medium tabular-nums">$ {valorTotalCaixas.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="text-base font-bold">Total geral</span>
                <span className="text-xl font-bold text-green-800 tabular-nums">$ {totalConsolidado.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {pool > 0 && (cash > 0 || zelle > 0 || totalReceived > 0) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">Registro de pagamento</p>
                <p className="text-xs text-blue-700">
                  Nesta Ordem de Serviço: $ {formatUsdValorRecebidoLivre(totalReceived)} · Espécie: $ {formatUsdValorRecebidoLivre(cash)} ·
                  Zelle: $ {formatUsdValorRecebidoLivre(zelle)}
                  {pendente > 0.005 ? ` · Pendente: $ ${formatUsdValorRecebidoLivre(pendente)}` : ""}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
