import React from "react";
import { cn } from "../../ui/utils";
import { Package } from "lucide-react";

export type ContainerBoxItemLine = {
  id?: string | null;
  name?: string | null;
  quantity?: number | null;
  weight?: number | null;
  observations?: string | null;
};

type Props = {
  items: ContainerBoxItemLine[];
  /** Mais compacto para células de tabela */
  compact?: boolean;
  emptyLabel?: string;
  className?: string;
};

export function ContainerBoxItemsList({
  items,
  compact = false,
  emptyLabel = "Nenhum item neste volume.",
  className,
}: Props) {
  const list = items ?? [];
  if (list.length === 0) {
    return (
      <p className={cn("text-xs text-muted-foreground flex items-center gap-1.5", compact && "py-1", className)}>
        <Package className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border/70 bg-muted/25 overflow-hidden divide-y divide-border/50",
        compact && "text-[11px]",
        className,
      )}
    >
      {list.map((it, i) => {
        const obs = typeof it.observations === "string" ? it.observations.trim() : "";
        return (
          <div
            key={it.id ?? `${String(it.name)}-${i}`}
            className={cn(compact ? "px-2 py-1.5" : "px-2.5 py-2")}
          >
            <div
              className={cn(
                "flex flex-wrap items-start sm:items-center justify-between gap-x-3 gap-y-1",
              )}
            >
              <span className="font-medium text-foreground leading-snug text-left min-w-0 flex-1">
                {it.name?.trim() || "—"}
              </span>
              <div className="flex items-center gap-3 shrink-0 text-muted-foreground tabular-nums text-xs">
                <span>Qtd. {it.quantity ?? 0}</span>
                <span>{(Number(it.weight) || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg</span>
              </div>
            </div>
            {obs.length > 0 && (
              <p
                className={cn(
                  "mt-1 text-muted-foreground leading-snug pl-0",
                  compact ? "text-[10px]" : "text-xs",
                )}
              >
                <span className="font-medium text-muted-foreground/90">Obs.: </span>
                {obs}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
