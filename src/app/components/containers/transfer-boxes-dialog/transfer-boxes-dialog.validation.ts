export type ValidationFail = { ok: false; message: string };
export type ValidationOk = { ok: true };
export type ValidationResult = ValidationOk | ValidationFail;

export function validatePreviewRequest(params: {
  sourceId: string;
  selectedIds: Set<string>;
  targetId: string;
  needsTargetLetter: boolean;
  letterDraft: string;
}): ValidationResult {
  if (!params.sourceId.trim()) {
    return { ok: false, message: "Container de origem inválido." };
  }
  if (params.selectedIds.size === 0) {
    return { ok: false, message: "Selecione ao menos um volume." };
  }
  if (!params.targetId.trim()) {
    return { ok: false, message: "Escolha o container de destino." };
  }
  if (params.needsTargetLetter) {
    const L = params.letterDraft.trim().toUpperCase();
    if (!/^[A-Z]$/.test(L)) {
      return { ok: false, message: "Informe uma letra de A a Z para o volume no destino." };
    }
  }
  return { ok: true };
}
