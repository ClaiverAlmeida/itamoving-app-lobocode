/** Garante que a data sempre seja YYYY-MM-DD (evita mudança de dia por fuso). */
export function toDateOnly(value: string | undefined | null): string {
    if (value == null) return "";
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s.slice(0, 10) : d.toISOString().slice(0, 10);
}