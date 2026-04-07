import type { DriverServiceOrder } from "../../../api";

/** Exibe valor em USD sem forçar 2 casas decimais (ex.: valor recebido em espécie). */
export function formatUsdValorRecebidoLivre(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export type ReciboBoxCategory =
  | "pequena"
  | "media"
  | "grande"
  | "fita"
  | "personalizada";

export const RECIBO_CATEGORY_LABEL: Record<ReciboBoxCategory, string> = {
  pequena: "Pequena",
  media: "Média",
  grande: "Grande",
  fita: "Fita adesiva",
  personalizada: "Personalizada",
};

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Classifica pela enum do catálogo quando a linha da OS traz `productType` (mapeado a partir de `ProductPrice`). */
export function mapCatalogProductTypeToRecibo(productType: unknown): ReciboBoxCategory | null {
  const v = String(productType ?? "").trim();
  switch (v) {
    case "SMALL_BOX":
      return "pequena";
    case "MEDIUM_BOX":
      return "media";
    case "LARGE_BOX":
      return "grande";
    case "TAPE_ADHESIVE":
      return "fita";
    case "PERSONALIZED_ITEM":
      return "personalizada";
    default:
      return null;
  }
}

export function classifyDriverProductType(type: string): ReciboBoxCategory | null {
  const raw = String(type ?? "").trim();
  if (!raw) return null;

  const up = raw.toUpperCase().replace(/\s+/g, "_");
  const key = stripDiacritics(raw).toLowerCase();

  if (up === "TAPE_ADHESIVE") return "fita";
  if (up === "PERSONALIZED_ITEM") return "personalizada";
  if (up === "SMALL_BOX") return "pequena";
  if (up === "MEDIUM_BOX") return "media";
  if (up === "LARGE_BOX") return "grande";

  if (
    up.includes("TAPE_ADHESIVE") ||
    /\bfita\b/i.test(raw) ||
    /\btape\b/i.test(raw) ||
    /adesiv/i.test(key)
  ) {
    return "fita";
  }
  if (up.includes("PERSONALIZED") || /personaliz/i.test(key)) {
    return "personalizada";
  }
  if (
    /\bsmall\b/i.test(raw) ||
    key === "pequena" ||
    /\bpequen/i.test(key) ||
    /\bcx\.?\s*pequen/i.test(key) ||
    /\bcaixa\s+pequen/i.test(key)
  ) {
    return "pequena";
  }
  if (
    /\bmedium\b/i.test(raw) ||
    key === "media" ||
    /\bm(e|e)dia\b/i.test(raw) ||
    /\bcaixa\s+m(e|e)dia\b/i.test(raw)
  ) {
    return "media";
  }
  if (
    /\blarge\b/i.test(raw) ||
    key === "grande" ||
    /\bgrand/i.test(key) ||
    /\bcaixa\s+grand/i.test(raw)
  ) {
    return "grande";
  }

  return null;
}

/** Resposta da API pode vir em camelCase ou snake_case. */
export function getOrdemProductsList(
  ordem: DriverServiceOrder,
): DriverServiceOrder["driverServiceOrderProducts"] {
  const fromCamel = ordem.driverServiceOrderProducts;
  const fromSnake = (
    ordem as unknown as {
      driver_service_order_products?: DriverServiceOrder["driverServiceOrderProducts"];
    }
  ).driver_service_order_products;
  const list = fromCamel ?? fromSnake ?? [];
  return Array.isArray(list) ? list : [];
}

export type ReciboRow = {
  key: string;
  tipoPrincipal: string;
  tipoCadastro: string;
  weight: number | undefined;
  value: string;
  /** Etiqueta física no container (N-LETRA), quando a linha já está vinculada. */
  etiqueta: string | null;
};

export function summarizeOrdemForRecibo(ordem: DriverServiceOrder) {
  const summary: Record<ReciboBoxCategory, number> = {
    pequena: 0,
    media: 0,
    grande: 0,
    fita: 0,
    personalizada: 0,
  };

  const products = getOrdemProductsList(ordem);

  const rows: ReciboRow[] = products.map((p, idx) => {
    const rawType = String(p?.type ?? "").trim();
    const category =
      mapCatalogProductTypeToRecibo((p as { productType?: string }).productType) ??
      classifyDriverProductType(rawType);
    if (category) summary[category] += 1;

    const tipoPrincipal = `${rawType}`;
    const valor = `$${Number(p.value ?? 0).toFixed(2)}`;
    const etiqueta =
      (p as { containerBoxNumber?: string | null }).containerBoxNumber?.trim() || null;

    return {
      key: String(p.id ?? `box-${idx}`),
      tipoPrincipal,
      tipoCadastro: rawType || "-",
      weight: p.weight,
      value: valor,
      etiqueta,
    };
  });

  return { rows, summary, totalUnidades: products.length };
}

/** Soma dos valores (USD) das caixas/produtos da ordem — alinhado ao formulário. */
export function sumValorTotalCaixasFromOrdem(ordem: DriverServiceOrder): number {
  return getOrdemProductsList(ordem).reduce((s, p) => s + Number(p?.value ?? 0), 0);
}

type OrdemComValorAgendamento = DriverServiceOrder & {
  appointment?: { value?: number; downPayment?: number };
};

/**
 * Mesmo "Total geral" do recibo e do cartão Pagamento na OS:
 * subtotal (agendamento − antecipação) + total dos volumes (espécie + Zelle repartem esse total, não somam à parte).
 */
export function totalGeralConsolidadoOrdem(ordem: OrdemComValorAgendamento): number {
  const valorAgendamento = Number(ordem.appointment?.value ?? 0);
  const valorAntecipacao = Number(ordem.appointment?.downPayment ?? 0);
  const subtotalAgendamento = Math.max(valorAgendamento - valorAntecipacao, 0);
  const valorTotalCaixas = sumValorTotalCaixasFromOrdem(ordem);
  return subtotalAgendamento + valorTotalCaixas;
}

