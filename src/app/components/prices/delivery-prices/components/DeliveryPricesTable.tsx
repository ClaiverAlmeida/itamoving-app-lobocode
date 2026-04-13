import React from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Search, Download, Edit, Trash2, Calendar, ChevronLeft, ChevronRight, Box, Package, PersonStanding } from "lucide-react";
import type { DeliveryPrice, DeliveryPricesPagination } from "../../../../api";
import { iconClassForBoxProductType, ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../../stock";
import { AdhesiveTapeIcon } from "../../../ui/adhesive-tape-icon";

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
            placeholder="Buscar por produtos, preço mínimo ou prazo..."
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
              <TableHead className="text-center">Produto</TableHead>
              <TableHead className="text-center">Mínimo (USD)</TableHead>
              <TableHead className="text-center">Prazo (dias)</TableHead>
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
                  <TableCell className="text-center justify-center flex items-center gap-1">
                    <div className="flex items-center gap-1 justify-center">
                      {entrega.product?.type?.includes("BOX") ? (
                        <Box className={`w-5 h-5 ${iconClassForBoxProductType(entrega.product?.type)}`} aria-hidden />
                      ) : entrega.product?.type === "PERSONALIZED_ITEM" ? (
                        <PersonStanding className="w-5 h-5 text-purple-600" />
                      ) : entrega.product?.type === "TAPE_ADHESIVE" ? (
                        <AdhesiveTapeIcon className="h-5 w-5 shrink-0" />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                    <span className="font-medium">{entrega.product?.name} - {ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[entrega.product?.type ?? ""]]}</span>
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

