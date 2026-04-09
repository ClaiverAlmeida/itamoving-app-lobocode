import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";

/** Tons reutilizáveis: combinem `items` + `colorPalette` (ou `tone` por item). */
export const STATUS_TONE_STYLES = {
  accent: {
    triggerSelectedClassName:
      "border-l-[var(--accent)] bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20",
    itemClassName:
      "focus:bg-[var(--accent)]/15 focus:text-[var(--accent)] data-[highlighted]:bg-[var(--accent)]/15 text-[var(--accent)] dark:focus:bg-[var(--accent)]/25 dark:data-[highlighted]:bg-[var(--accent)]/25",
    dotClassName: "bg-[var(--accent)]",
  },
  green: {
    triggerSelectedClassName:
      "border-l-green-600 bg-green-50 dark:bg-green-950/30 dark:border-l-green-500",
    itemClassName:
      "focus:bg-green-50 focus:text-green-700 data-[highlighted]:bg-green-50 text-green-700 dark:focus:bg-green-950/50 dark:data-[highlighted]:bg-green-950/50 dark:text-green-400",
    dotClassName: "bg-green-500",
  },
  secondary: {
    triggerSelectedClassName:
      "border-l-[var(--secondary)] bg-[var(--secondary)]/10 dark:bg-[var(--secondary)]/20",
    itemClassName:
      "focus:bg-[var(--secondary)]/15 focus:text-[var(--secondary)] data-[highlighted]:bg-[var(--secondary)]/15 text-[var(--secondary)] dark:focus:bg-[var(--secondary)]/25 dark:data-[highlighted]:bg-[var(--secondary)]/25",
    dotClassName: "bg-[var(--secondary)]",
  },
  destructive: {
    triggerSelectedClassName:
      "border-l-[var(--destructive)] bg-[var(--destructive)]/10 dark:bg-[var(--destructive)]/20",
    itemClassName:
      "focus:bg-[var(--destructive)]/15 focus:text-[var(--destructive)] data-[highlighted]:bg-[var(--destructive)]/15 text-[var(--destructive)] dark:focus:bg-[var(--destructive)]/25 dark:data-[highlighted]:bg-[var(--destructive)]/25",
    dotClassName: "bg-[var(--destructive)]",
  },
  blue: {
    triggerSelectedClassName:
      "border-l-blue-600 bg-blue-50 dark:bg-blue-950/35 dark:border-l-blue-500",
    itemClassName:
      "focus:bg-blue-50 focus:text-blue-900 data-[highlighted]:bg-blue-50 text-blue-900 dark:focus:bg-blue-950/40 dark:data-[highlighted]:bg-blue-950/40 dark:text-blue-200",
    dotClassName: "bg-blue-500",
  },
  yellow: {
    triggerSelectedClassName:
      "border-l-yellow-600 bg-yellow-50 dark:bg-yellow-950/35 dark:border-l-yellow-500",
    itemClassName:
      "focus:bg-yellow-50 focus:text-yellow-900 data-[highlighted]:bg-yellow-50 text-yellow-900 dark:focus:bg-yellow-950/40 dark:data-[highlighted]:bg-yellow-950/40 dark:text-yellow-200",
    dotClassName: "bg-yellow-500",
  },
  sky: {
    triggerSelectedClassName:
      "border-l-sky-600 bg-sky-50 dark:bg-sky-950/35 dark:border-l-sky-500",
    itemClassName:
      "focus:bg-sky-50 focus:text-sky-900 data-[highlighted]:bg-sky-50 text-sky-900 dark:focus:bg-sky-950/40 dark:data-[highlighted]:bg-sky-950/40 dark:text-sky-200",
    dotClassName: "bg-sky-500",
  },
  red: {
    triggerSelectedClassName:
      "border-l-red-600 bg-red-50 dark:bg-red-950/35 dark:border-l-red-500",
    itemClassName:
      "focus:bg-red-50 focus:text-red-800 data-[highlighted]:bg-red-50 text-red-800 dark:focus:bg-red-950/40 dark:data-[highlighted]:bg-red-950/40 dark:text-red-300",
    dotClassName: "bg-red-500",
  },
} as const;

export type StatusToneKey = keyof typeof STATUS_TONE_STYLES;

export type StatusSelectItem<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  /** Fixa o tom deste item; se omitido, usa `colorPalette` por índice (ciclo). */
  tone?: StatusToneKey;
};

/** Paleta padrão ao montar cores por posição (1º, 2º, 3º…). */
export const DEFAULT_STATUS_COLOR_PALETTE: readonly StatusToneKey[] = [
  "accent",
  "green",
  "secondary",
  "destructive",
  "blue",
  "yellow",
  "sky",
  "red",
];

export type StatusSelectProps<V extends string = string> = {
  value: V;
  onValueChange: (value: V) => void;
  items: readonly StatusSelectItem<V>[];
  colorPalette?: readonly StatusToneKey[];
  triggerClassName?: string;
  disabled?: boolean;
};

type ResolvedOption<V extends string> = {
  value: V;
  label: React.ReactNode;
  triggerSelectedClassName: string;
  itemClassName: string;
  dotClassName: string;
};

function resolveItemsToOptions<V extends string>(
  items: readonly StatusSelectItem<V>[],
  palette: readonly StatusToneKey[],
): ResolvedOption<V>[] {
  return items.map((item, index) => {
    const toneKey = item.tone ?? palette[index % palette.length]!;
    const tone = STATUS_TONE_STYLES[toneKey];
    return {
      value: item.value,
      label: item.label,
      triggerSelectedClassName: tone.triggerSelectedClassName,
      itemClassName: tone.itemClassName,
      dotClassName: tone.dotClassName,
    };
  });
}

export function StatusSelect<V extends string>({
  value,
  onValueChange,
  items,
  colorPalette = DEFAULT_STATUS_COLOR_PALETTE,
  triggerClassName,
  disabled,
}: StatusSelectProps<V>) {
  const options = React.useMemo(
    () => resolveItemsToOptions(items, colorPalette),
    [items, colorPalette],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as V)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "border-l-4 font-medium transition-colors",
          selected?.triggerSelectedClassName ??
            "border-l-muted-foreground/40 bg-muted/50 dark:bg-muted/30",
          triggerClassName,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={opt.itemClassName}
          >
            <span
              className={cn(
                "mr-2 inline-block size-2 rounded-full shrink-0",
                opt.dotClassName,
              )}
            />
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
