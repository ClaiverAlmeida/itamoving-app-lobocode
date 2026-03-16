/**
 * Garante que a data sempre seja YYYY-MM-DD (evita mudança de dia por timezone).
 * - Se já for YYYY-MM-DD ou ISO (YYYY-MM-DDThh:mm...), usa os primeiros 10 caracteres (sem converter com toISOString).
 * - Para outros formatos, usa getFullYear/getMonth/getDate (horário local) para não deslocar o dia.
 */
export function toDateOnly(value: string | undefined | null): string {
    if (value == null) return "";
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s.length >= 10 ? s.slice(0, 10) : "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/**
 * Formata uma string YYYY-MM-DD para dd/MM/yyyy sem usar Date (evita -1 dia por timezone).
 * Se o valor não for YYYY-MM-DD, retorna string vazia ou o próprio valor.
 */
export function formatDateOnlyToBR(value: string | undefined | null): string {
    if (value == null) return "";
    const s = String(value).trim();
    const iso = s.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
    return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

/**
 * Garante que o horário seja HH:mm (sem interpretação de timezone).
 * - Se for HH:mm ou HH:mm:ss (com ou sem Z), extrai HH:mm.
 * - Se for ISO com T, usa getHours/getMinutes em horário local.
 */
export function toTimeOnly(value: string | undefined | null): string {
    if (value == null) return "";
    const s = String(value).trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?/.test(s)) return s.slice(0, 5);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "";
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
}