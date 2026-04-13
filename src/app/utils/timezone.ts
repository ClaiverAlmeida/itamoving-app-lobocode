// Philadelphia usa o mesmo timezone IANA de New York.
const PHILADELPHIA_TIMEZONE = "America/New_York";

export function getAppTimeZone(): string {
  const configured = import.meta.env.VITE_APP_TIMEZONE?.trim?.();
  if (!configured || configured.length === 0) return PHILADELPHIA_TIMEZONE;

  // Suporte explícito para valor textual solicitado.
  if (configured.toLowerCase() === "philadelphia") return PHILADELPHIA_TIMEZONE;

  return configured;
}

export function toDateOnlyInAppTimeZone(value: Date | string): string {
  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const parsed = new Date(s);
    if (Number.isNaN(parsed.getTime())) return "";
    return toDateOnlyInAppTimeZone(parsed);
  }

  if (Number.isNaN(value.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: getAppTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}
