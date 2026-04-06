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
