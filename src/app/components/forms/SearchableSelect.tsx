"use client";

import React, { useState } from "react";
import { ChevronsUpDown, type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../ui/utils";

export type SearchableSelectOption = {
  /** Valor enviado ao `onValueChange` */
  value: string;
  label: string;
  /** Texto extra indexado pela busca (id, código, etc.) */
  searchValue?: string;
};

export interface SearchableSelectProps {
  items: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** Opção “vazia” (ex.: `__none__`) exibida no topo da lista */
  emptyOption?: { value: string; label: string };
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverContentClassName?: string;
  /** Ícone à esquerda de cada linha (e da opção vazia, se houver) */
  itemIcon?: LucideIcon;
  /** Quando `value` não está em `items` (ex.: registro removido) */
  fallbackLabel?: string;
  id?: string;
  /** Expõe `aria-required` no trigger (ex.: container obrigatório na OS) */
  required?: boolean;
}

function commandSearchString(
  label: string,
  value: string,
  searchExtras?: string,
): string {
  return [label, value, searchExtras ?? ""].filter(Boolean).join(" ");
}

/** Normaliza para comparação (minúsculas, sem acentos). */
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Filtro estilo SQL `%texto%`: cada termo (separado por espaço) deve aparecer em qualquer lugar
 * do texto indexado — não usa o command-score padrão do cmdk (que exige ordem das letras).
 */
function searchableSelectFilter(
  value: string,
  search: string,
  keywords?: string[],
): number {
  const raw = search.trim();
  if (!raw) return 1;
  const haystack = normalizeForSearch(
    [value, ...(keywords ?? [])].filter(Boolean).join(" "),
  );
  const tokens = raw
    .split(/\s+/)
    .map((t) => normalizeForSearch(t))
    .filter(Boolean);
  if (tokens.length === 0) return 1;
  return tokens.every((t) => haystack.includes(t)) ? 1 : 0;
}

export function SearchableSelect({
  items,
  value,
  onValueChange,
  emptyOption,
  label,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  disabled = false,
  className,
  triggerClassName,
  popoverContentClassName,
  itemIcon: ItemIcon,
  fallbackLabel,
  id,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((i) => i.value === value);
  const emptySelected = emptyOption && value === emptyOption.value;

  const displayText = emptySelected
    ? emptyOption.label
    : selectedItem
      ? selectedItem.label
      : fallbackLabel ?? placeholder;

  const showMuted =
    !selectedItem &&
    !emptySelected &&
    !(fallbackLabel != null && value !== "");

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required || undefined}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal border-2 border-slate-200 shadow-none",
              "bg-white hover:!bg-white hover:text-inherit",
              "dark:bg-input/30 dark:border-input dark:hover:!bg-input/30",
              showMuted && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <span className="truncate text-left">{displayText}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0 z-[300]",
            popoverContentClassName,
          )}
          align="start"
        >
          <Command filter={searchableSelectFilter}>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {emptyOption ? (
                  <CommandItem
                    key={emptyOption.value}
                    value={commandSearchString(
                      emptyOption.label,
                      emptyOption.value,
                    )}
                    onSelect={() => {
                      onValueChange(emptyOption.value);
                      setOpen(false);
                    }}
                  >
                    {ItemIcon ? (
                      <ItemIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                    ) : null}
                    {emptyOption.label}
                  </CommandItem>
                ) : null}
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={commandSearchString(
                      item.label,
                      item.value,
                      item.searchValue,
                    )}
                    onSelect={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                  >
                    {ItemIcon ? (
                      <ItemIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
