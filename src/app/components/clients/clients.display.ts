/** Traço tipográfico quando não há dado para exibir. */
export const EMPTY_DISPLAY = '—';

/** Junta partes não vazias (após trim) com vírgula; se nenhuma, retorna `EMPTY_DISPLAY`. */
export function joinComma(parts: (string | undefined | null)[]): string {
  const a = parts.map((p) => (p ?? '').trim()).filter(Boolean);
  return a.length ? a.join(', ') : EMPTY_DISPLAY;
}

/** Texto único ou traço se vazio. */
export function orDash(s: string | undefined | null): string {
  const v = (s ?? '').trim();
  return v.length ? v : EMPTY_DISPLAY;
}

/**
 * Rótulo do select de cliente (ex.: agendamentos): nome + cidade/estado (EUA),
 * sem vírgulas órfãs quando faltam cidade ou estado.
 */
export function formatClienteAgendamentoLabel(cliente: {
  usaName?: string | null;
  usaAddress?: unknown;
}): string {
  const usa = cliente.usaAddress as { cidade?: string; estado?: string } | undefined;
  const loc = joinComma([usa?.cidade, usa?.estado]);
  const name = (cliente.usaName ?? '').trim();
  const nameDisp = name.length ? name : EMPTY_DISPLAY;
  if (loc === EMPTY_DISPLAY) return nameDisp;
  if (nameDisp === EMPTY_DISPLAY) return loc;
  return `${nameDisp} — ${loc}`;
}

/** Cidade, estado e ZIP (EUA) em uma linha. */
export function formatUsaLocationLine(usa: {
  cidade?: string;
  estado?: string;
  zipCode?: string;
}): string {
  return joinComma([usa.cidade, usa.estado, usa.zipCode]);
}

/** Cidade e estado (Brasil) em uma linha. */
export function formatBrCityStateLine(br: { cidade?: string; estado?: string }): string {
  return joinComma([br.cidade, br.estado]);
}

/** Rodapé: cidade/estado e CEP com separador —; evita vírgulas soltas. */
export function formatBrCityStateCepFooter(br: {
  cidade?: string;
  estado?: string;
  cep?: string;
}): string {
  const loc = joinComma([br.cidade, br.estado]);
  const cep = (br.cep ?? '').trim();
  if (loc === EMPTY_DISPLAY && !cep) return EMPTY_DISPLAY;
  if (!cep) return loc;
  if (loc === EMPTY_DISPLAY) return `CEP: ${cep}`;
  return `${loc} — CEP: ${cep}`;
}

/** Linha de logradouro BR: rua, número, complemento; bairro com — quando existir. */
export function formatBrazilStreetBlock(
  br: {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
  },
): string {
  const base = joinComma([br.rua, br.numero, br.complemento]);
  const bairro = (br.bairro ?? '').trim();
  if (bairro && base !== EMPTY_DISPLAY) return `${base} — ${bairro}`;
  if (bairro) return bairro;
  return base;
}
