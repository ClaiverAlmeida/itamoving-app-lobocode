import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryPricesPagination, PrecoEntrega } from "../../../api";
import { getDeliveryPricesPage } from "./delivery-prices.crud";
import {
  handleCreateDeliverySubmit,
  handleDeleteDelivery,
  handleEditDeliverySubmit,
  handleExportDeliveries,
} from "./delivery-prices.handlers";
import type { DeliveryPriceForm, DeliveryPricesTabProps } from "./delivery-prices.types";
import { resetDeliveryForm, toUfBrasil, toUfEua } from "./delivery-prices.utils";
import { DeliveryPricesTable } from "./components/DeliveryPricesTable";
import { DeliveryPricesDialogs } from "./components/DeliveryPricesDialogs";

export function DeliveryPricesTab(props: DeliveryPricesTabProps) {
  const { setPrecosEntrega, deletePrecoEntrega, className } = props;

  const [entregas, setEntregas] = useState<PrecoEntrega[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
  const [isEditEntregaDialogOpen, setIsEditEntregaDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<PrecoEntrega | null>(null);
  const [formEntrega, setFormEntrega] = useState<DeliveryPriceForm>(() => resetDeliveryForm());

  const [pageEntrega, setPageEntrega] = useState(1);
  const [limitEntrega] = useState(10);
  const [paginationEntrega, setPaginationEntrega] = useState<DeliveryPricesPagination | null>(null);

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

  useEffect(() => {
    carregarPrecosEntrega(pageEntrega);
  }, [pageEntrega, limitEntrega]);

  const resetFormEntrega = () => setFormEntrega(resetDeliveryForm());

  const entregasFiltradas = entregas.filter(
    (p) =>
      (p.originCity ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.destinationCity ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.originState ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.destinationState ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
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

  const handleDeleteEntrega = async (id: string) => {
    await handleDeleteDelivery({
      id,
      selectedEntrega,
      setSelectedEntrega,
      pageEntrega,
      carregarPrecosEntrega,
      deletePrecoEntrega,
    });
  };

  const handleExportarEntregas = async () => {
    await handleExportDeliveries();
  };

  const onEditEntrega = (entrega: PrecoEntrega) => {
    setSelectedEntrega(entrega);
    setFormEntrega({
      originCity: entrega.originCity,
      originState: toUfEua(entrega.originState),
      destinationCity: entrega.destinationCity,
      destinationState: toUfBrasil(entrega.destinationState),
      pricePerKg: entrega.pricePerKg.toString(),
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
              <CardTitle>Preços de Entrega por Cidade</CardTitle>
              <CardDescription>
                Configure os preços de frete entre cidades EUA-Brasil
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
            onDelete={handleDeleteEntrega}
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
        onOpenChangeEntrega={(open) => {
          setIsEntregaDialogOpen(open);
          if (open) {
            resetFormEntrega();
            setSelectedEntrega(null);
            setIsEditEntregaDialogOpen(false);
          }
        }}
        onCloseEntrega={() => setIsEntregaDialogOpen(false)}
        isEditEntregaDialogOpen={isEditEntregaDialogOpen}
        onOpenChangeEditEntrega={(open) => {
          setIsEditEntregaDialogOpen(open);
          if (!open) {
            setSelectedEntrega(null);
          } else {
            setIsEntregaDialogOpen(false);
          }
        }}
        onCloseEditEntrega={() => setIsEditEntregaDialogOpen(false)}
        formEntrega={formEntrega}
        setFormEntrega={setFormEntrega}
        onSubmitCreate={handleSubmitEntrega}
        onSubmitEdit={handleEditEntrega}
      />
    </>
  );
}

