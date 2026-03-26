import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";

export function ServicesSearchBar({
  searchTerm,
  onChange,
}: {
  searchTerm: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone, origem ou destino..."
          value={searchTerm}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}

