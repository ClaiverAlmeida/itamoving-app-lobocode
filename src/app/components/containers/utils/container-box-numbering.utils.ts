/**
 * Numeração alfanumérica da rotina de container: sequência + letra (ex.: 1-A, 2-A).
 * @see Rotina do Container (documento operacional)
 */

const BOX_LABEL = /^(\d+)-([A-Z])$/i;

export function maxSequenceForLetter(boxNumbers: string[], letter: string): number {
  const L = letter.toUpperCase();
  let max = 0;
  for (const raw of boxNumbers) {
    const m = BOX_LABEL.exec(raw?.trim() ?? "");
    if (!m) continue;
    const seq = parseInt(m[1], 10);
    const lb = m[2].toUpperCase();
    if (lb === L && !Number.isNaN(seq)) max = Math.max(max, seq);
  }
  return max;
}

export function formatBoxLabel(sequence: number, letter: string): string {
  return `${sequence}-${letter.toUpperCase()}`;
}

export function previewNextLabels(
  existingBoxNumbers: string[],
  letter: string,
  count: number,
): string[] {
  if (count <= 0 || !letter) return [];
  const L = letter.toUpperCase().slice(0, 1);
  let start = maxSequenceForLetter(existingBoxNumbers, L);
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    start += 1;
    out.push(formatBoxLabel(start, L));
  }
  return out;
}

export function isValidVolumeLetter(value: string): boolean {
  return /^[A-Za-z]$/.test(value?.trim() ?? "");
}
