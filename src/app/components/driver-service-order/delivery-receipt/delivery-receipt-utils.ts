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

function toFriendlyTypeLabel(raw: unknown): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const byCategory = mapCatalogProductTypeToRecibo(value);
  if (byCategory) return RECIBO_CATEGORY_LABEL[byCategory];
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
  quantityLabel?: string;
  /** Etiqueta física no container (N-LETRA), quando a linha já está vinculada. */
  etiqueta: string | null;
  /** Linha de frete (sem etiqueta de container). */
  isFrete?: boolean;
  /** Quando for frete, informa se existe caixa vinculada e seus detalhes. */
  freightHasBox?: boolean;
  freightBoxLabel?: string | null;
  freightBoxName?: string | null;
  freightBoxType?: string | null;
};

function isLinhaFreteProduto(p: DriverServiceOrder["driverServiceOrderProducts"][number]): boolean {
  const id = (p as { deliveryPriceId?: string | null }).deliveryPriceId;
  return Boolean(id != null && String(id).trim() !== "");
}

/** Separa volumes/produtos catálogo das linhas de frete (`deliveryPriceId`). */
export function partitionOrdemProductsByFrete(ordem: DriverServiceOrder) {
  const list = getOrdemProductsList(ordem);
  const volumes: typeof list = [];
  const frete: typeof list = [];
  for (const p of list) {
    if (isLinhaFreteProduto(p)) frete.push(p);
    else volumes.push(p);
  }
  return { volumes, frete };
}

export function sumValorVolumesProdutosOrdem(ordem: DriverServiceOrder): number {
  const { volumes } = partitionOrdemProductsByFrete(ordem);
  return volumes.reduce((s, p) => s + Number(p?.value ?? 0), 0);
}

export function sumValorFreteOrdem(ordem: DriverServiceOrder): number {
  const { frete } = partitionOrdemProductsByFrete(ordem);
  return frete.reduce((s, p) => s + Number(p?.value ?? 0), 0);
}

export function summarizeOrdemForRecibo(ordem: DriverServiceOrder) {
  const summary: Record<ReciboBoxCategory, number> = {
    pequena: 0,
    media: 0,
    grande: 0,
    fita: 0,
    personalizada: 0,
  };

  const products = getOrdemProductsList(ordem);
  const rows: ReciboRow[] = [];
  let fitaCount = 0;
  let fitaPesoTotal = 0;
  let fitaValorTotal = 0;

  for (let idx = 0; idx < products.length; idx += 1) {
    const p = products[idx];
    const rawType = String(p?.type ?? "").trim();
    if (isLinhaFreteProduto(p)) {
      const valorF = Number(p.value ?? 0);
      const etiquetaFrete =
        (p as { containerBoxNumber?: string | null }).containerBoxNumber?.trim() || null;
      const freteTemCaixa = p.weight != null;
      const boxName = String(p.product?.name ?? "").trim() || null;
      const boxType = toFriendlyTypeLabel(p.product?.type ?? p.productType);
      rows.push({
        key: String(p.id ?? `frete-${idx}`),
        tipoPrincipal: rawType || "Frete",
        tipoCadastro: "FRETE",
        weight: p.weight == null ? undefined : Number(p.weight),
        value: `$${valorF.toFixed(2)}`,
        etiqueta: null,
        isFrete: true,
        freightHasBox: freteTemCaixa,
        freightBoxLabel: freteTemCaixa ? etiquetaFrete : null,
        freightBoxName: freteTemCaixa ? boxName : null,
        freightBoxType: freteTemCaixa ? boxType : null,
      });
      continue;
    }

    const category =
      mapCatalogProductTypeToRecibo((p as { productType?: string }).productType) ??
      classifyDriverProductType(rawType);
    if (category) summary[category] += 1;

    const peso = Number(p.weight == null ? 0 : p.weight);
    const valorNumerico = Number(p.value ?? 0);

    if (category === "fita") {
      fitaCount += 1;
      fitaPesoTotal += Number.isFinite(peso) ? peso : 0;
      fitaValorTotal += Number.isFinite(valorNumerico) ? valorNumerico : 0;
      continue;
    }

    const etiqueta =
      (p as { containerBoxNumber?: string | null }).containerBoxNumber?.trim() || null;

    rows.push({
      key: String(p.id ?? `box-${idx}`),
      tipoPrincipal: `${rawType}`,
      tipoCadastro: rawType || "-",
      weight: p.weight == null ? undefined : Number(p.weight ?? 0),
      value: `$${valorNumerico.toFixed(2)}`,
      etiqueta,
      isFrete: false,
    });
  }

  if (fitaCount > 0) {
    rows.push({
      key: "fita-adesiva-consolidada",
      tipoPrincipal: "Fita adesiva",
      tipoCadastro: "TAPE_ADHESIVE",
      weight: fitaPesoTotal,
      value: `$${fitaValorTotal.toFixed(2)}`,
      quantityLabel: `${fitaCount}x`,
      etiqueta: null,
      isFrete: false,
    });
  }

  return { rows, summary, totalUnidades: products.length };
}

/** Soma dos valores (USD) das caixas/produtos da ordem — alinhado ao formulário. */
export function sumValorTotalCaixasFromOrdem(ordem: DriverServiceOrder): number {
  return getOrdemProductsList(ordem).reduce((s, p) => s + Number(p?.value ?? 0), 0);
}

type OrdemComValorAgendamento = DriverServiceOrder & {
  appointment?: { value?: number; downPayment?: number };
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Mesmo "Total geral" do recibo e do cartão Pagamento na OS:
 * subtotal (agendamento − antecipação) + total dos volumes (base para o que falta pagar).
 */
export function totalGeralConsolidadoOrdem(ordem: OrdemComValorAgendamento): number {
  const valorAgendamento = Number(ordem.appointment?.value ?? 0);
  const valorAntecipacao = Number(ordem.appointment?.downPayment ?? 0);
  const subtotalAgendamento = Math.max(valorAgendamento - valorAntecipacao, 0);
  const valorTotalCaixas = sumValorTotalCaixasFromOrdem(ordem);
  return subtotalAgendamento + valorTotalCaixas;
}

/** Soma espécie + Zelle registrada na ordem. */
export function totalRecebidoPagamentoOrdem(ordem: DriverServiceOrder): number {
  const cash = Number(ordem.cashReceivedUsd ?? 0);
  const zelle = Number(ordem.zelleReceivedUsd ?? 0);
  return round2(Math.max(0, cash + zelle));
}

/** Diferença entre a base da ordem e o recebido registrado (pagamento parcial). */
export function saldoPendentePagamentoOrdem(ordem: OrdemComValorAgendamento): number {
  const base = totalGeralConsolidadoOrdem(ordem);
  const rec = totalRecebidoPagamentoOrdem(ordem);
  return Math.max(0, round2(base - rec));
}

