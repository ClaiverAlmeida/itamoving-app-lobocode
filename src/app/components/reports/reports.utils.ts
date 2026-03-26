import type { Cliente } from "../../api";

export function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function normalizeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function filterClientesBySearch<T extends { usaNome?: string; usaCpf?: string; usaPhone?: string }>(params: {
  clientes: T[];
  searchTerm: string;
}) {
  const { clientes, searchTerm } = params;
  const term = searchTerm.trim().toLowerCase();
  if (!term) return clientes;

  return clientes.filter(
    (cliente) =>
      cliente.usaNome?.toLowerCase().includes(term) ||
      (cliente.usaCpf ?? "").includes(searchTerm) ||
      (cliente.usaPhone ?? "").includes(searchTerm),
  );
}

