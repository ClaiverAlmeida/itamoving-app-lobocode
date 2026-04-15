import { toDateOnlyInAppTimeZone } from "../../utils";

export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || dateStr.length < 10) return new Date(NaN);
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(5, 7), 10) - 1;
  const day = parseInt(dateStr.slice(8, 10), 10);
  return new Date(y, m, day, 12, 0, 0, 0);
}

export function toYYYYMMDD(value: string | Date): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const normalized = toDateOnlyInAppTimeZone(s);
    return normalized || null;
  }
  if (!Number.isNaN(value.getTime())) {
    const normalized = toDateOnlyInAppTimeZone(value);
    return normalized || null;
  }
  return null;
}

export function isCollectionDateInPeriod(
  collectionDate: string,
  period: { startDate: string | Date; endDate: string | Date },
): boolean {
  const d = toYYYYMMDD(collectionDate);
  const startStr = toYYYYMMDD(period.startDate);
  const endStr = toYYYYMMDD(period.endDate);
  if (!d || !startStr || !endStr) return false;
  return d >= startStr && d <= endStr;
}
