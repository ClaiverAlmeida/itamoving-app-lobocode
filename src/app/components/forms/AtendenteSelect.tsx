"use client";

import React, { useEffect } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface AtendenteSelectUser {
  id: string;
  nome: string;
}

export interface AtendenteSelectProps {
  /** Usuário atual (ex.: do AuthContext) — o valor exibido e enviado será o id deste usuário */
  user: AtendenteSelectUser | null;
  /** Valor selecionado (id do atendente) */
  value: string;
  /** Callback quando o valor é definido (ex.: ao carregar o usuário) */
  onValueChange: (id: string) => void;
  /** Rótulo do campo */
  label?: string;
  /** Campo desabilitado (somente leitura) */
  disabled?: boolean;
  /** Campo obrigatório */
  required?: boolean;
  /** Classe CSS do container */
  className?: string;
  /** Texto quando não há usuário */
  emptyPlaceholder?: string;
}

/**
 * Select de atendente que exibe o usuário atual como única opção e envia o id no payload.
 * Reutilizável em qualquer página que precise de "atendente = usuário logado".
 */
export function AtendenteSelect({
  user,
  value,
  onValueChange,
  label = "Atendente *",
  disabled = true,
  required = true,
  className,
  emptyPlaceholder = "Nenhum usuário",
}: AtendenteSelectProps) {
  useEffect(() => {
    if (user?.id && !value) {
      onValueChange(user.id);
    }
  }, [user?.id, value, onValueChange]);

  const displayName = user ? (user.nome ?? "") : emptyPlaceholder;
  const selectValue = value || user?.id || undefined;

  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      {label ? (
        <Label htmlFor="atendente-select">{label}</Label>
      ) : null}
      <Select
        value={selectValue}
        onValueChange={onValueChange}
        required={required}
        disabled={disabled}
      >
        <SelectTrigger id="atendente-select" className="w-full">
          <SelectValue placeholder={emptyPlaceholder}>
            {user ? displayName : emptyPlaceholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {user ? (
            <SelectItem value={user.id}>
              {user.nome ?? ""}
            </SelectItem>
          ) : (
            <SelectItem value="__none__" disabled>
              {emptyPlaceholder}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
