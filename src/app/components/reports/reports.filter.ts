import type { Appointment, Client, Container, FinancialTransaction } from "../../api";
import { toDateOnly } from "../../utils/date";

export type ReportDateRangeFilter = {
  from: string;
  to: string;
};

function isDateInRange(isoDate: string | undefined, range: ReportDateRangeFilter): boolean {
  const d = toDateOnly(isoDate);
  if (!d) return false;
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

export function filterTransacoesByDateRange(
  transacoes: FinancialTransaction[],
  range: ReportDateRangeFilter,
): FinancialTransaction[] {
  if (!range.from && !range.to) return transacoes;
  return transacoes.filter((t) => isDateInRange(t.date, range));
}

export function filterClientesByDateRange(clientes: Client[], range: ReportDateRangeFilter): Client[] {
  if (!range.from && !range.to) return clientes;
  return clientes.filter((c) => isDateInRange(c.createdAt, range));
}

function appointmentReferenceDate(a: Appointment): string | undefined {
  return a.collectionDate ?? a.createdAt;
}

export function filterAgendamentosByDateRange(agendamentos: Appointment[], range: ReportDateRangeFilter): Appointment[] {
  if (!range.from && !range.to) return agendamentos;
  return agendamentos.filter((a) => {
    const raw = appointmentReferenceDate(a);
    if (!raw || !toDateOnly(raw)) return true;
    return isDateInRange(raw, range);
  });
}

function containerReferenceDate(c: Container): string | undefined {
  return c.shipmentDate ?? c.boardingDate;
}

export function filterContainersByDateRange(containers: Container[], range: ReportDateRangeFilter): Container[] {
  if (!range.from && !range.to) return containers;
  return containers.filter((c) => {
    const raw = containerReferenceDate(c);
    if (!raw || !toDateOnly(raw)) return true;
    return isDateInRange(raw, range);
  });
}
