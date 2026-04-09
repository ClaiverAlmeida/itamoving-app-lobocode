import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { AgendamentoConfirmedBackend } from "../../../api";
import {
  EMPTY_DISPLAY,
  formatUsaLocationLine,
  joinComma,
} from "../../clients/clients.display";

type UsaAddr = AgendamentoConfirmedBackend["client"]["usaAddress"];

/** Endereço de coleta (EUA) para lista do app motorista; seguro com campos opcionais vazios. */
export function formatDriverColetaUsaLine(usa: Partial<UsaAddr> | null | undefined): string {
  const u = usa ?? {};
  const streetCore = joinComma([u.rua, u.numero]);
  const comp = (u.complemento ?? "").trim();
  let streetBlock: string;
  if (streetCore !== EMPTY_DISPLAY && comp) {
    streetBlock = `${streetCore} — ${comp}`;
  } else if (comp) {
    streetBlock = comp;
  } else {
    streetBlock = streetCore;
  }

  const loc = formatUsaLocationLine({
    cidade: u.cidade,
    estado: u.estado,
    zipCode: u.zipCode,
  });

  const parts = [streetBlock, loc].filter((p) => p !== EMPTY_DISPLAY);
  return parts.length ? parts.join(" — ") : EMPTY_DISPLAY;
}

export function formatCollectionDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";
  const prefix = dateStr.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(prefix);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const localDate = new Date(year, month - 1, day);
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
  }
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
}

