import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "../ui/utils";

export interface EmptyStateAlertProps {
  /** Título do aviso */
  title: string;
  /** Descrição ou instrução para o usuário */
  description: string;
  /** Variante visual: destructive (danger) ou default */
  variant?: "default" | "destructive";
  /** Ícone à esquerda; se não informado, usa AlertCircle em variant destructive */
  icon?: ReactNode;
  /** Classes adicionais no container */
  className?: string;
}

/**
 * Alerta reutilizável para situações de "estado vazio" ou pré-requisito não atendido
 * (ex.: nenhum cliente cadastrado, lista vazia, ação bloqueada).
 */
export function EmptyStateAlert({
  title,
  description,
  variant = "destructive",
  icon,
  className,
}: EmptyStateAlertProps) {
  const Icon = icon ?? (variant === "destructive" ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Alert
        variant={variant}
        className={cn("flex items-start gap-3", className)}
      >
        {Icon}
        <div className="grid gap-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
      </Alert>
    </motion.div>
  );
}
