import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { TransferContainerBoxesResult } from "../../../api/services/containers.service";
import { containersCrud } from "../containers.crud";
import { VOLUME_REFERENCIA_INFORMATIVO } from "../containers.constants";
import {
  filterDestinationContainers,
  needsVolumeLetterForTarget,
  sumSelectedWeight,
} from "./transfer-boxes-dialog.utils";
import { validatePreviewRequest } from "./transfer-boxes-dialog.validation";
import type { ContainerTransferBoxesDialogProps } from "./transfer-boxes-dialog.types";

type Step = "form" | "review";

export function useTransferBoxesDialog({
  open,
  sourceContainer,
  allContainers,
  candidates,
  initialSelectedIds,
  onCompleted,
  onOpenChange,
}: Pick<
  ContainerTransferBoxesDialogProps,
  | "open"
  | "sourceContainer"
  | "allContainers"
  | "candidates"
  | "initialSelectedIds"
  | "onCompleted"
  | "onOpenChange"
>) {
  const volRef = VOLUME_REFERENCIA_INFORMATIVO;
  const sourceId = sourceContainer.id ?? "";

  const destOptions = useMemo(
    () => filterDestinationContainers(allContainers, sourceId),
    [allContainers, sourceId],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetId, setTargetId] = useState("");
  const [letterDraft, setLetterDraft] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [preview, setPreview] = useState<TransferContainerBoxesResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setPreview(null);
    setTargetId("");
    setLetterDraft("");
    const init = new Set(
      (initialSelectedIds?.length ? initialSelectedIds : []).filter((id) =>
        candidates.some((c) => c.driverServiceOrderProductId === id),
      ),
    );
    if (init.size === 0 && candidates.length === 1) {
      init.add(candidates[0].driverServiceOrderProductId);
    }
    setSelectedIds(init);
  }, [open, initialSelectedIds, candidates]);

  const needsTargetLetter = useMemo(() => {
    const t = destOptions.find((c) => c.id === targetId) ?? null;
    return needsVolumeLetterForTarget(t);
  }, [destOptions, targetId]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedWeight = useMemo(
    () => sumSelectedWeight(candidates, selectedIds),
    [candidates, selectedIds],
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(candidates.map((c) => c.driverServiceOrderProductId)));
  }, [candidates]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const runPreview = useCallback(async () => {
    const v = validatePreviewRequest({
      sourceId,
      selectedIds,
      targetId,
      needsTargetLetter,
      letterDraft,
    });
    if (!v.ok) {
      toast.error(v.message);
      return;
    }

    setLoadingPreview(true);
    try {
      const result = await containersCrud.previewTransferBoxes(sourceId, {
        targetContainerId: targetId,
        driverServiceOrderProductIds: [...selectedIds],
        ...(needsTargetLetter ? { volumeLetterForTarget: letterDraft.trim().toUpperCase() } : {}),
      });
      if (result.success && result.data) {
        setPreview(result.data);
        setStep("review");
      } else {
        toast.error(result.error ?? "Não foi possível simular a transferência.");
      }
    } finally {
      setLoadingPreview(false);
    }
  }, [sourceId, selectedIds, targetId, needsTargetLetter, letterDraft]);

  const executeTransfer = useCallback(async () => {
    if (!sourceId || !preview) return;
    setSubmitting(true);
    try {
      const result = await containersCrud.transferBoxes(sourceId, {
        targetContainerId: targetId,
        driverServiceOrderProductIds: [...selectedIds],
        ...(needsTargetLetter ? { volumeLetterForTarget: letterDraft.trim().toUpperCase() } : {}),
      });
      if (result.success && result.data) {
        toast.success("Transferência concluída. Etiquetas e volumes atualizados.");
        await onCompleted({
          source: result.data.sourceContainer,
          target: result.data.targetContainer,
        });
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Falha ao transferir.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [sourceId, preview, targetId, selectedIds, needsTargetLetter, letterDraft, onCompleted, onOpenChange]);

  const goBackToForm = useCallback(() => {
    setStep("form");
    setPreview(null);
  }, []);

  return {
    volRef,
    sourceId,
    destOptions,
    needsTargetLetter,
    selectedIds,
    setSelectedIds,
    targetId,
    setTargetId,
    letterDraft,
    setLetterDraft,
    step,
    preview,
    loadingPreview,
    submitting,
    selectedWeight,
    toggle,
    selectAll,
    selectNone,
    runPreview,
    executeTransfer,
    goBackToForm,
  };
}
