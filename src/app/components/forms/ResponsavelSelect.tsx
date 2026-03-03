"use client";

import React, { useState } from "react";
import { ChevronsUpDown, User } from "lucide-react";
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

/** Item mínimo para exibição no select (id + name; role opcional para rótulo) */
export interface ResponsavelSelectItem {
  id: string;
  name: string;
  role?: string;
}

export interface ResponsavelSelectProps {
  /** Lista de itens (ex.: motoristas/usuários) */
  items: ResponsavelSelectItem[];
  /** Id do item selecionado (valor enviado no payload) */
  value: string;
  /** Callback ao selecionar; recebe o id do item */
  onValueChange: (id: string) => void;
  /** Rótulo do campo */
  label?: string;
  /** Placeholder do trigger quando nenhum valor selecionado */
  placeholder?: string;
  /** Placeholder do campo de busca dentro do popover */
  searchPlaceholder?: string;
  /** Mensagem quando a busca não encontra resultados */
  emptyMessage?: string;
  /** Desabilita o campo */
  disabled?: boolean;
  /** Classes adicionais no container */
  className?: string;
  /** Função para exibir rótulo do role (ex.: DRIVER → "Motorista") */
  getRoleLabel?: (role: string | undefined) => string;
}

const defaultGetRoleLabel = (role: string | undefined): string => {
  if (role === "DRIVER") return "Motorista";
  return role ? "Outro" : "";
};

export function ResponsavelSelect({
  items,
  value,
  onValueChange,
  label = "Responsável",
  placeholder = "Selecione o responsável...",
  searchPlaceholder = "Buscar responsável...",
  emptyMessage = "Nenhum responsável encontrado.",
  disabled = false,
  className,
  getRoleLabel = defaultGetRoleLabel,
}: ResponsavelSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((item) => item.id === value);
  const displayText = selected
    ? [selected.name, getRoleLabel(selected.role)].filter(Boolean).join(" - ")
    : placeholder;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
            )}
          >
            {displayText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const roleLabel = getRoleLabel(item.role);
                  const itemLabel = roleLabel
                    ? `${item.name} - ${roleLabel}`
                    : item.name;
                  return (
                    <CommandItem
                      key={item.id}
                      value={itemLabel}
                      onSelect={() => {
                        onValueChange(item.id);
                        setOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {itemLabel}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
