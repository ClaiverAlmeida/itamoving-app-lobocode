/** Total da OS para repartição espécie / Zelle: subtotal agendamento + volumes. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computePaymentPoolUsd(params: {
  valorAgendamento: number;
  valorAntecipacao: number;
  valorTotalVolumes: number;
}): number {
  const sub = Math.max(params.valorAgendamento - params.valorAntecipacao, 0);
  return round2(sub + params.valorTotalVolumes);
}

/**
 * Total registrado nesta OS (espécie + Zelle) pode ser menor que o pool (pagamento parcial / valor pendente).
 * Espécie e Zelle repartem apenas o total registrado.
 */
export function computePaymentSplitUsd(params: {
  paymentPoolUsd: number;
  totalReceivedUsd: number;
  cashUsd: number;
}): { cashReceivedUsd: number; zelleReceivedUsd: number } {
  const pool = round2(Math.max(0, params.paymentPoolUsd));
  const total = round2(Math.min(Math.max(params.totalReceivedUsd, 0), pool));
  const cash = round2(Math.min(Math.max(params.cashUsd, 0), total));
  const zelle = round2(total - cash);
  return { cashReceivedUsd: cash, zelleReceivedUsd: zelle };
}
