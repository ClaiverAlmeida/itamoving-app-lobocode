"use client";

import React from "react";
import { User } from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";

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
  const options = items.map((item) => {
    const roleLabel = getRoleLabel(item.role);
    const itemLabel = roleLabel ? `${item.name} - ${roleLabel}` : item.name;
    return {
      value: item.id,
      label: itemLabel,
      searchValue: `${item.name} ${roleLabel}`,
    };
  });

  return (
    <SearchableSelect
      className={className}
      label={label}
      items={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      disabled={disabled}
      itemIcon={User}
    />
  );
}
