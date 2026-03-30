import React from "react";
import { Filter, Download } from "lucide-react";
import { Button } from "../../ui/button";
import type { Client, FinancialTransaction } from "../../../api";
import { FinancialNewTransactionDialog } from "./FinancialNewTransactionDialog";

export function FinancialHeaderSection(props: {
  showFilters: boolean;
  carregarClientes: () => Promise<Client[]>;
  onToggleFilters: () => void;
  onCreateTransacao: (t: FinancialTransaction) => void;
}) {
  const { showFilters, onToggleFilters, carregarClientes, onCreateTransacao } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestão Financeira</h2>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Fluxo de caixa, receitas e despesas</p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap sm:gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={onToggleFilters}
            className="w-full sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <FinancialNewTransactionDialog carregarClientes={carregarClientes} onCreateTransacao={onCreateTransacao} />
        </div>
      </div>
    </div>
  );
}

