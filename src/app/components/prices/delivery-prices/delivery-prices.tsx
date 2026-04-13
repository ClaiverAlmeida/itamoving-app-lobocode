import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryPricesPagination, DeliveryPrice, ProductPrice } from "../../../api";
import { getDeliveryPricesPage, getProductPrices } from "./delivery-prices.crud";
import {
  handleCreateDeliverySubmit,
  handleDeleteDelivery,
  handleEditDeliverySubmit,
  handleExportDeliveries,
} from "./delivery-prices.handlers";
import type { DeliveryPriceForm, DeliveryPricesTabProps } from "./delivery-prices.types";
import { resetDeliveryForm } from "./delivery-prices.utils";
import { DeliveryPricesTable } from "./components/DeliveryPricesTable";
import { DeliveryPricesDialogs } from "./components/DeliveryPricesDialogs";
import { ConfirmAlertDialog } from "../../ui/confirm-alert-dialog";

export function DeliveryPricesTab(props: DeliveryPricesTabProps) {
  const { setPrecosEntrega, deleteDeliveryPrice, className } = props;

  const [entregas, setEntregas] = useState<DeliveryPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isEditEntregaDialogOpen, setIsEditEntregaDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<DeliveryPrice | null>(null);
  const [formEntrega, setFormEntrega] = useState<DeliveryPriceForm>(() => resetDeliveryForm());

  const [pageEntrega, setPageEntrega] = useState(1);
  const [limitEntrega] = useState(10);
  const [paginationEntrega, setPaginationEntrega] = useState<DeliveryPricesPagination | null>(null);
  const [deleteEntregaId, setDeleteEntregaId] = useState<string | null>(null);
  const [deleteEntregaLoading, setDeleteEntregaLoading] = useState(false);

  const carregarPrecosEntrega = async (page = pageEntrega) => {
    const result = await getDeliveryPricesPage({ page, limit: limitEntrega });
    if (result.success && result.data) {
      setEntregas(result.data);
      setPrecosEntrega(result.data);
      if (result.pagination) setPaginationEntrega(result.pagination);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const carregarProdutos = useCallback(async (): Promise<ProductPrice[]> => {
    const result = await getProductPrices();
    if (result.success && result.data) {
      return result.data.filter((p) => p.active === true && p.type !== "TAPE_ADHESIVE");
    }
    if (result.error) {
      toast.error(result.error);
    }
    return [];
  }, []);

  useEffect(() => {
    carregarPrecosEntrega(pageEntrega);
  }, [pageEntrega, limitEntrega]);

  const resetFormEntrega = () => setFormEntrega(resetDeliveryForm());

  const entregasFiltradas = entregas.filter(
    (p) =>
      (p.minimumPrice ?? 0).toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.deliveryDeadline ?? 0).toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.active ? "Ativa" : "Inativa")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    //Adicionar filtros de produtos aqui
  );

  const handleSubmitEntrega = async (e: React.FormEvent) => {
    await handleCreateDeliverySubmit({
      e,
      form: formEntrega,
      setIsEntregaDialogOpen,
      setSelectedEntrega,
      resetFormEntrega,
      setPageEntrega,
      carregarPrecosEntrega,
    });
  };

  const handleEditEntrega = async (e: React.FormEvent) => {
    await handleEditDeliverySubmit({
      e,
      form: formEntrega,
      selectedEntrega,
      setIsEditEntregaDialogOpen,
      setSelectedEntrega,
      resetFormEntrega,
      pageEntrega,
      carregarPrecosEntrega,
    });
  };

  const openDeleteEntrega = (id: string) => setDeleteEntregaId(id);

  const confirmDeleteEntrega = async () => {
    if (!deleteEntregaId) return;
    setDeleteEntregaLoading(true);
    try {
      await handleDeleteDelivery({
        id: deleteEntregaId,
        selectedEntrega,
        setSelectedEntrega,
        pageEntrega,
        carregarPrecosEntrega,
        deleteDeliveryPrice,
      });
      setDeleteEntregaId(null);
    } finally {
      setDeleteEntregaLoading(false);
    }
  };

  const handleExportarEntregas = async () => {
    await handleExportDeliveries();
  };

  const onEditEntrega = (entrega: DeliveryPrice) => {
    setSelectedEntrega(entrega);
    setFormEntrega({
      productId: entrega.productId,
      minimumPrice: entrega.minimumPrice.toString(),
      deliveryDeadline: entrega.deliveryDeadline.toString(),
      active: entrega.active,
    });
    setIsEditEntregaDialogOpen(true);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Preços de Entrega</CardTitle>
              <CardDescription>
                Configure os preços de frete por produtos, preço mínimo ou prazo
              </CardDescription>
            </div>
            <Button
              className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] hover:opacity-90 w-full sm:w-auto"
              onClick={() => setIsEntregaDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Rota
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <DeliveryPricesTable
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onExport={handleExportarEntregas}
            entregasFiltradas={entregasFiltradas}
            onEdit={onEditEntrega}
            onDelete={openDeleteEntrega}
            pagination={paginationEntrega}
            onPrevPage={() => setPageEntrega((p) => Math.max(1, p - 1))}
            onNextPage={() =>
              setPageEntrega((p) =>
                paginationEntrega ? Math.min(paginationEntrega.totalPages, p + 1) : p,
              )
            }
          />
        </CardContent>
      </Card>

      <DeliveryPricesDialogs
        isEntregaDialogOpen={isEntregaDialogOpen}
        editingProductSummary={selectedEntrega?.product ?? null}
        onCarregarProdutos={carregarProdutos}
        onOpenChangeEntrega={(open) => {
          setIsEntregaDialogOpen(open);
          if (open) {
            resetFormEntrega();
            setSelectedEntrega(null);
            setIsEditEntregaDialogOpen(false);
          } else {
            resetFormEntrega();
            setSelectedEntrega(null);
          }
        }}
        onCloseEntrega={() => {
          resetFormEntrega();
          setIsEntregaDialogOpen(false);
        }}
        isEditEntregaDialogOpen={isEditEntregaDialogOpen}
        onOpenChangeEditEntrega={(open) => {
          setIsEditEntregaDialogOpen(open);
          if (!open) {
            setSelectedEntrega(null);
            resetFormEntrega();
          } else {
            setIsEntregaDialogOpen(false);
          }
        }}
        onCloseEditEntrega={() => {
          resetFormEntrega();
          setSelectedEntrega(null);
          setIsEditEntregaDialogOpen(false);
        }}
        formEntrega={formEntrega}
        setFormEntrega={setFormEntrega}
        onSubmitCreate={handleSubmitEntrega}
        onSubmitEdit={handleEditEntrega}
      />

      <ConfirmAlertDialog
        open={Boolean(deleteEntregaId)}
        onOpenChange={(open) => {
          if (!open) setDeleteEntregaId(null);
        }}
        title="Excluir preço de entrega?"
        description={
          <>
            <p>Tem certeza que deseja excluir este preço de entrega?</p>
            <p className="text-xs">Esta ação não pode ser desfeita.</p>
          </>
        }
        confirmLabel="Excluir"
        tone="destructive"
        loading={deleteEntregaLoading}
        onConfirm={confirmDeleteEntrega}
      />
    </>
  );
}

