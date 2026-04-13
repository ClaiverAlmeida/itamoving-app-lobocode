import React from "react";
import { CardContent } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Search, Download, Package, Edit, Trash2, Box, Ruler, Weight, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import type { ProductPrice, ProductPricePagination } from "../../../../api";
import { AdhesiveTapeIcon } from "../../../ui/adhesive-tape-icon";
import { iconClassForBoxProductType } from "../../../stock";

export type ProductsPricesTableProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  onExport: () => Promise<void> | void;
  produtosFiltrados: ProductPrice[];
  onEdit: (produto: ProductPrice) => void;
  onDelete: (id: string) => void;
  pagination: ProductPricePagination | null;
  page: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

function getProdutoTypeBadgeLabel(type: ProductPrice["type"]) {
  switch (type) {
    case "SMALL_BOX":
      return "Caixa Pequena";
    case "MEDIUM_BOX":
      return "Caixa Média";
    case "LARGE_BOX":
      return "Caixa Grande";
    case "PERSONALIZED_ITEM":
      return "Item Personalizado";
    case "TAPE_ADHESIVE":
      return "Fita Adesiva";
    default:
      return "Fita Adesiva";
  }
}

export function ProductsPricesTable(props: ProductsPricesTableProps) {
  const {
    searchTerm,
    onSearchTermChange,
    onExport,
    produtosFiltrados,
    onEdit,
    onDelete,
    pagination,
    onPrevPage,
    onNextPage,
  } = props;

  return (
    <>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onExport}
            className="w-full sm:w-10"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center">Produto</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Detalhes</TableHead>
                <TableHead className="text-center">Custo</TableHead>
                <TableHead className="text-center">Venda</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {produto.type?.includes("BOX") ? (
                          <Box className={`w-5 h-5 ${iconClassForBoxProductType(produto.type)}`} aria-hidden />
                        ) : produto.type === "PERSONALIZED_ITEM" ? (
                          <Package className="w-5 h-5 text-purple-600" aria-hidden />
                        ) : produto.type === "TAPE_ADHESIVE" ? (
                          <AdhesiveTapeIcon className="h-5 w-5 shrink-0" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" aria-hidden />
                        )}
                        <div>
                          <div className="font-medium">{produto.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{getProdutoTypeBadgeLabel(produto.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs space-y-1 flex flex-col items-center">
                        {produto.dimensions && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Ruler className="w-3 h-3" />
                            {produto.dimensions}
                          </div>
                        )}
                        {produto.maxWeight && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Weight className="w-3 h-3" />
                            {produto.maxWeight}kg
                          </div>
                        )}
                        {!produto.dimensions && !produto.maxWeight && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Minus className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-muted-foreground">${Number(produto.costPrice).toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-green-700">${Number(produto.salePrice).toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={produto.active ? "default" : "secondary"}>
                        {produto.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(produto)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(produto.id)}>
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
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={!pagination.hasPreviousPage}
                onClick={onPrevPage}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={!pagination.hasNextPage}
                onClick={onNextPage}
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}

