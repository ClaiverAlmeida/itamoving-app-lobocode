import React from "react";
import { motion } from "motion/react";
import type { ClientePorEstado } from "../../reports.payload";
import type { Client } from "../../../../api";
import { ClientesPorEstadoCard } from "../../cards/ClientesPorEstadoCard";
import { ClientesSearchCard } from "../../cards/ClientesSearchCard";

export function ClientesReportSection(props: {
  clientesPorEstado: ClientePorEstado[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filteredClientes: Client[];
}) {
  const { clientesPorEstado, searchTerm, onSearchTermChange, filteredClientes } = props;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ClientesPorEstadoCard clientesPorEstado={clientesPorEstado} />
        <ClientesSearchCard searchTerm={searchTerm} onChangeSearchTerm={onSearchTermChange} filteredClientes={filteredClientes} />
      </div>
    </motion.div>
  );
}

