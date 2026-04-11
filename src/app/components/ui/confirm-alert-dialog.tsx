"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";
import { Loader2 } from "lucide-react";
import { cn } from "./utils";

export type ConfirmAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Conteúdo explicativo (texto ou bloco com parágrafos). */
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** destructive = ação irreversível (excluir); default = confirmar sem ênfase destrutiva. */
  tone?: "destructive" | "default";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  contentClassName?: string;
};

/** Confirmação acessível (Radix AlertDialog), mesmo padrão visual dos outros alertas do app. */
export function ConfirmAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "destructive",
  loading = false,
  onConfirm,
  contentClassName,
}: ConfirmAlertDialogProps) {
  const handleConfirm = () => {
    void onConfirm();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className={cn("max-w-md", contentClassName)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description != null && description !== false ? (
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-2 text-left">{description}</div>
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aguarde…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
