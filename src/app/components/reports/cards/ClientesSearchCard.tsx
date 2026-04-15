import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import type { Client } from "../../../api";
import { ReportSearchInput } from "../components/ui/ReportSearchInput";

export function ClientesSearchCard(props: {
  searchTerm: string;
  onChangeSearchTerm: (value: string) => void;
  filteredClientes: Client[];
}) {
  const { searchTerm, onChangeSearchTerm, filteredClientes } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Busca de Clientes</CardTitle>
        <CardDescription>Busque por nome, CPF ou telefone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReportSearchInput
          value={searchTerm}
          onChange={onChangeSearchTerm}
          placeholder="Digite para buscar..."
          aria-label="Buscar cliente por nome, CPF ou telefone"
        />

        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {filteredClientes.map((cliente) => {
            const usa = cliente.usaAddress as {
              cidade?: string;
              estado?: string;
              zipCode?: string;
              cep?: string;
            };
            const br = cliente.brazilAddress as { cidade?: string; estado?: string; cep?: string };
            const usaPostal = usa.zipCode ?? usa.cep ?? "";
            return (
            <Card key={cliente.id} className="bg-slate-50">
              <CardContent className="p-3">
                <h3 className="font-semibold mb-2">{cliente.usaName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p>CPF: {cliente.usaCpf}</p>
                    <p>Tel: {cliente.usaPhone}</p>
                  </div>
                  <div>
                    <p>
                      {usa.cidade ?? ""}, {usa.estado ?? ""} {usaPostal}
                    </p>
                    <p>
                      → {br.cidade ?? ""}, {br.estado ?? ""} {br.cep ?? ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}

          {filteredClientes.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

