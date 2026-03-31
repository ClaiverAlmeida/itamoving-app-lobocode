import React from "react";
import { BarChart3 } from "lucide-react";

/** Estado vazio reutilizável para gráficos (barra, pizza, linha, área). */
export function ChartEmpty(props: { message: string; minHeightClass?: string; className?: string }) {
  const { message, minHeightClass = "min-h-[230px]", className = "" } = props;
  return (
    <div
      className={`flex ${minHeightClass} flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center ${className}`.trim()}
    >
      <BarChart3 className="size-9 text-muted-foreground/45" aria-hidden />
      <p className="max-w-xs text-sm text-muted-foreground leading-snug">{message}</p>
    </div>
  );
}
