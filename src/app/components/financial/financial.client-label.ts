import type { Client } from "../../api";

/** Cidade/estado EUA a partir de `usaAddress` (chaves PT ou EN). */
export function formatUsaAddressCityState(usaAddress: Record<string, unknown> | undefined): string {
  if (!usaAddress || typeof usaAddress !== "object") return "";
  const cidade = String(usaAddress.cidade ?? usaAddress.city ?? "").trim();
  const estado = String(usaAddress.estado ?? usaAddress.state ?? "").trim();
  if (cidade && estado) return `${cidade}, ${estado}`;
  return cidade || estado;
}

/** Rótulo só com dados EUA para selects e listas do financeiro. */
export function formatFinancialClientOptionLabel(cliente: Client): string {
  const nome = String(cliente.usaName ?? "").trim();
  const loc = formatUsaAddressCityState(cliente.usaAddress as Record<string, unknown>);
  if (nome && loc) return `${nome} · ${loc}`;
  return nome || loc || cliente.id;
}
