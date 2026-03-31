import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../ui/input";

export function FinancialTransactionsHistorySearch(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { value, onChange, placeholder = "Buscar no histórico…" } = props;

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 border-slate-200 bg-white pl-10 shadow-sm dark:bg-input/30"
        aria-label="Filtrar histórico de transações"
      />
    </div>
  );
}
