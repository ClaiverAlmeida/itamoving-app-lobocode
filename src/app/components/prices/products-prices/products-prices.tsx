import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ProductPrice, ProductPricePagination } from "../../../api";
import { getProductsPage } from "./products-prices.crud";
import { handleCreateSubmit, handleDelete, handleEditSubmit, handleExport } from "./products-prices.handlers";
import type { ProductPriceForm, ProductsPricesTabProps } from "./products-prices.types";
import { resetProductForm } from "./products-prices.utils";
import { ProductsPricesTable } from "./components/ProductsPricesTable";
import { ProductsPricesDialogs } from "./components/ProductsPricesDialogs";
import { ConfirmAlertDialog } from "../../ui/confirm-alert-dialog";

export function ProductsPricesTab(props: ProductsPricesTabProps) {
  const { setPrecosProdutos, deleteProductPrice, className } = props;

  const [produtos, setProdutos] = useState<ProductPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);
  const [isEditProdutoDialogOpen, setIsEditProdutoDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<ProductPrice | null>(null);
  const [formProduto, setFormProduto] = useState<ProductPriceForm>(() => resetProductForm());

  const [pageProduto, setPageProduto] = useState(1);
  const [limitProduto] = useState(10);
  const [paginationProduto, setPaginationProduto] = useState<ProductPricePagination | null>(null);
  const [deleteProdutoId, setDeleteProdutoId] = useState<string | null>(null);
  const [deleteProdutoLoading, setDeleteProdutoLoading] = useState(false);

  const carregarProdutos = async (page = pageProduto) => {
    const result = await getProductsPage({ page, limit: limitProduto });
    if (result.success && result.data) {
      setProdutos(result.data);
      setPrecosProdutos(result.data);
      if (result.pagination) setPaginationProduto(result.pagination);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    carregarProdutos(pageProduto);
  }, [pageProduto, limitProduto]);

  const resetFormProduto = () => {
    setFormProduto(resetProductForm());
  };

  const produtosFiltrados = produtos.filter((p) =>
    (p.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmitProduto = async (e: React.FormEvent) => {
    await handleCreateSubmit({
      e,
      formProduto,
      setIsProdutoDialogOpen,
      setIsEditProdutoDialogOpen,
      setSelectedProduto,
      resetFormProduto,
      pageProduto,
      setPageProduto,
      carregarProdutos,
    });
  };

  const handleEditProduto = async (e: React.FormEvent) => {
    await handleEditSubmit({
      e,
      formProduto,
      selectedProduto,
      setIsEditProdutoDialogOpen,
      setSelectedProduto,
      resetFormProduto,
      pageProduto,
      carregarProdutos,
    });
  };

  const openDeleteProduto = (id: string) => setDeleteProdutoId(id);

  const confirmDeleteProduto = async () => {
    if (!deleteProdutoId) return;
    setDeleteProdutoLoading(true);
    try {
      await handleDelete({
        id: deleteProdutoId,
        selectedProduto,
        setSelectedProduto,
        pageProduto,
        carregarProdutos,
        deleteProductPrice,
      });
      setDeleteProdutoId(null);
    } finally {
      setDeleteProdutoLoading(false);
    }
  };

  const handleExportProdutos = async () => {
    await handleExport({});
  };

  const onEditProduto = (produto: ProductPrice) => {
    setSelectedProduto(produto);
    setFormProduto({
      type: produto.type,
      name: produto.name,
      dimensions: produto.dimensions || "",
      maxWeight: produto.maxWeight?.toString() || "",
      costPrice: produto.costPrice.toString(),
      salePrice: produto.salePrice.toString(),
      active: produto.active,
      variablePrice: produto.variablePrice || false,
    });
    setIsEditProdutoDialogOpen(true);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Tabela de Produtos</CardTitle>
              <CardDescription>Gerencie preços e produtos</CardDescription>
            </div>
            <Button
              className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F] hover:opacity-90 w-full sm:w-auto"
              onClick={() => {
                setIsProdutoDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>

        <ProductsPricesTable
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onExport={handleExportProdutos}
          produtosFiltrados={produtosFiltrados}
          onEdit={onEditProduto}
          onDelete={openDeleteProduto}
          pagination={paginationProduto}
          page={pageProduto}
          onPrevPage={() => setPageProduto((p) => Math.max(1, p - 1))}
          onNextPage={() =>
            setPageProduto((p) =>
              paginationProduto ? Math.min(paginationProduto.totalPages, p + 1) : p,
            )
          }
        />
      </Card>

      <ProductsPricesDialogs
        isProdutoDialogOpen={isProdutoDialogOpen}
        onOpenChangeProduto={(open) => {
          setIsProdutoDialogOpen(open);
          if (open) {
            resetFormProduto();
            setSelectedProduto(null);
            setIsEditProdutoDialogOpen(false);
          }
        }}
        onCloseProduto={() => setIsProdutoDialogOpen(false)}
        isEditProdutoDialogOpen={isEditProdutoDialogOpen}
        onOpenChangeEditProduto={(open) => setIsEditProdutoDialogOpen(open)}
        onCloseEditProduto={() => setIsEditProdutoDialogOpen(false)}
        formProduto={formProduto}
        setFormProduto={setFormProduto}
        onSubmitCreate={handleSubmitProduto}
        onSubmitEdit={handleEditProduto}
      />

      <ConfirmAlertDialog
        open={Boolean(deleteProdutoId)}
        onOpenChange={(open) => {
          if (!open) setDeleteProdutoId(null);
        }}
        title="Excluir produto?"
        description={
          <>
            <p>Tem certeza que deseja excluir este produto?</p>
            <p className="text-xs">Esta ação não pode ser desfeita.</p>
          </>
        }
        confirmLabel="Excluir"
        tone="destructive"
        loading={deleteProdutoLoading}
        onConfirm={confirmDeleteProduto}
      />
    </>
  );
}

