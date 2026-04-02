import type { Container } from "../../../api";

export function volumeUseLabel(
  container: Container,
  volRef: number,
): { n: number; pct: number; exceeds: boolean } {
  const n = container.boxes?.length ?? 0;
  const pct = volRef > 0 ? (n / volRef) * 100 : 0;
  return { n, pct, exceeds: n > volRef };
}

export function weightUse(container: Container): { kg: number; pct: number; exceeds: boolean } {
  const lim = container.fullWeight ?? null;
  const kg = container.totalWeight ?? 0;
  const pct = lim != null && lim > 0 ? (kg / lim) * 100 : 0;
  return {
    kg,
    pct,
    exceeds: lim != null && lim > 0 && kg > lim,
  };
}

export function filterDestinationContainers(allContainers: Container[], sourceId: string): Container[] {
  return allContainers.filter((c) => {
    if (!c.id || c.id === sourceId) return false;
    if (c.status === "DELIVERED" || c.status === "CANCELLED") return false;
    return true;
  });
}

export function sumSelectedWeight(
  candidates: { driverServiceOrderProductId: string; weightKg: number }[],
  selectedIds: Set<string>,
): number {
  let s = 0;
  for (const c of candidates) {
    if (selectedIds.has(c.driverServiceOrderProductId)) s += c.weightKg ?? 0;
  }
  return s;
}

export function needsVolumeLetterForTarget(target: Container | null): boolean {
  if (!target) return false;
  const v = target.volumeLetter;
  return !(v && /^[A-Za-z]$/.test(String(v).trim()));
}
