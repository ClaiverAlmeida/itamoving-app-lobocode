import React from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Search, Download, MapPin, Edit, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { DeliveryPrice, DeliveryPricesPagination } from "../../../../api";

export type DeliveryPricesTableProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  onExport: () => Promise<void> | void;
  entregasFiltradas: DeliveryPrice[];
  onEdit: (entrega: DeliveryPrice) => void;
  onDelete: (id: string) => void;
  pagination: DeliveryPricesPagination | null;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function DeliveryPricesTable(props: DeliveryPricesTableProps) {
  const {
    searchTerm,
    onSearchTermChange,
    onExport,
    entregasFiltradas,
    onEdit,
    onDelete,
    pagination,
    onPrevPage,
    onNextPage,
  } = props;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cidade ou estado..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={onExport} className="w-full sm:w-10">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">Origem</TableHead>
              <TableHead className="text-center">Destino</TableHead>
              <TableHead className="text-center">Preço/Kg</TableHead>
              <TableHead className="text-center">Mínimo</TableHead>
              <TableHead className="text-center">Prazo</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entregasFiltradas.length === 0 ? (
              <TableRow className="text-center justify-center">
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground justify-center text-center">
                  Nenhum preço de entrega cadastrado
                </TableCell>
              </TableRow>
            ) : (
              entregasFiltradas.map((entrega) => (
                <TableRow key={entrega.id} className="hover:bg-muted/30 text-center justify-center">
                  <TableCell className="text-center justify-center">
                    <div className="flex items-center gap-2 justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{entrega.originCity}</div>
                        <div className="text-xs text-muted-foreground">{entrega.originState}, USA</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center justify-center">
                    <div className="flex items-center gap-2 justify-center">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">{entrega.destinationCity}</div>
                        <div className="text-xs text-muted-foreground">{entrega.destinationState}, Brasil</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center justify-center">
                    <span className="font-semibold text-green-700">${Number(entrega.pricePerKg).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-center justify-center">
                    <span className="text-muted-foreground">${Number(entrega.minimumPrice).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-center justify-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span>{entrega.deliveryDeadline} dias</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center justify-center">
                    <Badge variant={entrega.active ? "default" : "secondary"}>
                      {entrega.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center justify-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(entrega)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(entrega.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
            {pagination.total > 0 && <> · {pagination.total} registro(s)</>}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled={!pagination.hasPreviousPage} onClick={onPrevPage}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled={!pagination.hasNextPage} onClick={onNextPage}>
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

