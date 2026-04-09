import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";

export type UnassignContainerOrderConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nome do remetente / rótulo da ordem */
  senderLabel: string;
  orderId: string;
  containerNumber?: string | null;
  confirming?: boolean;
  onConfirm: () => void | Promise<void>;
};

/**
 * Confirmação antes de desvincular uma ordem de serviço de um container.
 */
export function UnassignContainerOrderConfirmDialog({
  open,
  onOpenChange,
  senderLabel,
  orderId,
  containerNumber,
  confirming = false,
  onConfirm,
}: UnassignContainerOrderConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover ordem deste container?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left text-sm text-muted-foreground">
              <p>
                A ordem será desvinculada
                {containerNumber?.trim() ? (
                  <>
                    {" "}
                    do container{" "}
                    <span className="font-mono font-semibold text-foreground">{containerNumber.trim()}</span>
                  </>
                ) : (
                  " deste container"
                )}
                . Os volumes de carga deixarão de contar neste container até nova vinculação.
              </p>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs space-y-1">
                <p>
                  <span className="text-muted-foreground">Remetente: </span>
                  <span className="font-medium text-foreground">{senderLabel || "—"}</span>
                </p>
                <p className="font-mono text-[11px] break-all text-foreground/90">
                  <span className="text-muted-foreground font-sans">OS </span>#{orderId}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={confirming}
            onClick={() => void onConfirm()}
          >
            {confirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo…
              </>
            ) : (
              "Remover vínculo"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
