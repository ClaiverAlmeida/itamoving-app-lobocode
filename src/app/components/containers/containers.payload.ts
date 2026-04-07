import type { Container, UpdateContainersDTO } from "../../api";

export type ContainerFormData = {
  number: string;
  type: string;
  seal: string;
  origin: string;
  destination: string;
  boardingDate: string;
  estimatedArrival: string;
  status: Container["status"];
  volume: string;
  emptyWeight: string;
  fullWeight: string;
  trackingLink: string;
  volumeLetter: string;
};

/** Uma ou duas letras A–Z (mesma regra da API). */
function normalizeVolumeLetter(value: string): string | undefined {
  const t = value.trim().toUpperCase();
  return /^[A-Z]{1,2}$/.test(t) ? t : undefined;
}

/**
 * Input controlado: até duas letras A–Z (permite uma letra só).
 */
export function sanitizeVolumeLetterInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
}

/** Validação antes de montar payload de criar/editar container. */
export function validateVolumeLetterForPayload(formData: ContainerFormData): string | null {
  const trimmed = formData.volumeLetter.trim();
  if (!trimmed) {
    return "Informe a letra do volume.";
  }
  if (!normalizeVolumeLetter(formData.volumeLetter)) {
    return "Informe uma ou duas letras de A a Z (ex.: A ou AA).";
  }
  return null;
}

function optionalKg(value: string): number | undefined {
  const t = value.trim();
  if (t === "") return undefined;
  const n = parseFloat(t.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Para PATCH: string vazia → `null` (limpar); inválido → `undefined` (não alterar). */
function optionalKgForUpdate(value: string): number | null | undefined {
  const t = value.trim();
  if (t === "") return null;
  const n = parseFloat(t.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export const buildCreateContainerPayload = (formData: ContainerFormData) => {
  const letter = normalizeVolumeLetter(formData.volumeLetter);
  if (!letter) {
    throw new Error("Letra do volume inválida. Use uma ou duas letras de A a Z (ex.: A ou AA).");
  }
  const ew = optionalKg(formData.emptyWeight);
  const fwRaw = parseFloat(formData.fullWeight.replace(",", "."));
  const fullWeight = Number.isFinite(fwRaw) && fwRaw >= 0.01 ? fwRaw : 0;
  return {
    number: formData.number,
    type: formData.type,
    seal: formData.seal,
    origin: formData.origin,
    destination: formData.destination,
    boardingDate: formData.boardingDate,
    estimatedArrival: formData.estimatedArrival,
    volume: parseFloat(formData.volume) || 0,
    trackingLink: formData.trackingLink,
    volumeLetter: letter,
    ...(ew !== undefined ? { emptyWeight: ew } : {}),
    fullWeight,
    status: formData.status as "PREPARATION" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED",
  };
};

export const buildUpdateContainerPayload = (
  formData: ContainerFormData,
  original: Container,
): UpdateContainersDTO => {
  const current = buildCreateContainerPayload(formData);
  const patch: UpdateContainersDTO = {};

  if (current.number !== original.number) patch.number = current.number;
  if (current.type !== original.type) patch.type = current.type;
  if (current.seal !== original.seal) patch.seal = current.seal;
  if (current.origin !== original.origin) patch.origin = current.origin;
  if (current.destination !== original.destination) patch.destination = current.destination;
  if (current.boardingDate !== original.boardingDate) patch.boardingDate = current.boardingDate;
  if (current.estimatedArrival !== original.estimatedArrival) patch.estimatedArrival = current.estimatedArrival;
  if (current.volume !== original.volume) patch.volume = current.volume;
  if (current.trackingLink !== original.trackingLink) patch.trackingLink = current.trackingLink;
  if (current.status !== original.status) patch.status = current.status;
  const currVolumeLetter = normalizeVolumeLetter(formData.volumeLetter) ?? null;
  const origVolumeLetter = (original.volumeLetter ?? "").trim().toUpperCase() || null;
  if (currVolumeLetter !== origVolumeLetter) patch.volumeLetter = currVolumeLetter ?? "";

  const ew = optionalKgForUpdate(formData.emptyWeight);
  if (ew !== undefined) {
    const orig = original.emptyWeight ?? null;
    if (ew !== orig) patch.emptyWeight = ew;
  }

  const fwRaw = parseFloat(formData.fullWeight.replace(",", "."));
  if (Number.isFinite(fwRaw) && fwRaw >= 0.01) {
    const orig = original.fullWeight ?? null;
    if (fwRaw !== orig) patch.fullWeight = fwRaw;
  }

  return patch;
};

