import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

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

