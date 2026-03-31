import type { Client } from "../../api";

export function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Ex.: +12,5% ou −3,2% (sinal unicode para negativos). */
export function formatPercentDelta(value: number) {
  const rounded = Math.round(value * 10) / 10;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return `${rounded >= 0 ? "+" : "−"}${body}%`;
}

export function normalizeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function filterClientesBySearch<T extends { usaName?: string; usaCpf?: string; usaPhone?: string }>(params: {
  clientes: T[];
  searchTerm: string;
}) {
  const { clientes, searchTerm } = params;
  const term = searchTerm.trim().toLowerCase();
  if (!term) return clientes;

  return clientes.filter(
    (cliente) =>
      cliente.usaName?.toLowerCase().includes(term) ||
      (cliente.usaCpf ?? "").includes(searchTerm) ||
      (cliente.usaPhone ?? "").includes(searchTerm),
  );
}

