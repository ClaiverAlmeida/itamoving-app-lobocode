import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import type { DeliveryPriceForm } from "../delivery-prices.types";
import { SearchableSelect } from "../../../forms";
import { ITEM_LABELS, PRODUCT_TYPE_TO_ITEM_KEY } from "../../../stock";
import { MapPin, Package } from "lucide-react";
import type { DeliveryPrice, ProductPrice } from "../../../../api";

export type DeliveryPricesDialogsProps = {
  isEntregaDialogOpen: boolean;
  onOpenChangeEntrega: (open: boolean) => void;
  onCarregarProdutos: () => Promise<ProductPrice[]>;
  onCloseEntrega: () => void;

  isEditEntregaDialogOpen: boolean;
  onOpenChangeEditEntrega: (open: boolean) => void;
  onCloseEditEntrega: () => void;

  /** Produto já vinculado à rota (API), garantido no select se não vier na lista paginada. */
  editingProductSummary: DeliveryPrice["product"] | null;

  formEntrega: DeliveryPriceForm;
  setFormEntrega: React.Dispatch<React.SetStateAction<DeliveryPriceForm>>;

  onSubmitCreate: (e: React.FormEvent) => void | Promise<void>;
  onSubmitEdit: (e: React.FormEvent) => void | Promise<void>;
};

function buildProductSelectItems(produtos: ProductPrice[]) {
  return produtos.map((produto) => ({
    value: produto.id,
    label: `${produto.name} - ${ITEM_LABELS[PRODUCT_TYPE_TO_ITEM_KEY[produto.type]]}`,
    searchValue: [produto.name, produto.size, produto.type, produto.id].filter(Boolean).join(" "),
  }));
}

function mergeEditingSummaryIntoProducts(
  list: ProductPrice[],
  summary: DeliveryPrice["product"] | null,
  isEditOpen: boolean,
): ProductPrice[] {
  if (!isEditOpen || !summary) return list;
  if (list.some((p) => p.id === summary.id)) return list;
  const stub: ProductPrice = {
    id: summary.id,
    name: summary.name,
    type: summary.type,
    costPrice: 0,
    salePrice: 0,
    active: true,
    variablePrice: false,
  };
  return [stub, ...list];
}

export function DeliveryPricesDialogs(props: DeliveryPricesDialogsProps) {
  const {
    isEntregaDialogOpen,
    onOpenChangeEntrega,
    onCarregarProdutos,
    onCloseEntrega,
    isEditEntregaDialogOpen,
    onOpenChangeEditEntrega,
    onCloseEditEntrega,
    editingProductSummary,
    formEntrega,
    setFormEntrega,
    onSubmitCreate,
    onSubmitEdit,
  } = props;

  const [produtos, setProdutos] = useState<ProductPrice[]>([]);
  const [produtosLoading, setProdutosLoading] = useState(false);

  const anyDialogOpen = isEntregaDialogOpen || isEditEntregaDialogOpen;

  useEffect(() => {
    if (!anyDialogOpen) {
      setProdutos([]);
      return;
    }

    let cancelled = false;
    setProdutosLoading(true);
    void onCarregarProdutos()
      .then((list) => {
        if (!cancelled) setProdutos(list);
      })
      .finally(() => {
        if (!cancelled) setProdutosLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [anyDialogOpen, onCarregarProdutos]);

  const produtosParaSelect = useMemo(
    () => mergeEditingSummaryIntoProducts(produtos, editingProductSummary, isEditEntregaDialogOpen),
    [produtos, editingProductSummary, isEditEntregaDialogOpen],
  );

  const productItems = useMemo(() => buildProductSelectItems(produtosParaSelect), [produtosParaSelect]);

  const dialogShellClass =
    "w-[95vw] max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto";

  return (
    <>
      <Dialog open={isEntregaDialogOpen} onOpenChange={onOpenChangeEntrega}>
        <DialogContent className={dialogShellClass}>
          <DialogHeader>
            <DialogTitle>Novo Preço de Entrega</DialogTitle>
            <DialogDescription>
              Configure a rota (valores e prazo) e o produto vinculado ao frete
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Rota
                </div>
                <p className="text-xs text-muted-foreground">
                  Preço mínimo, prazo e se a rota está ativa
                </p>

                <div className="space-y-2">
                  <Label htmlFor="minimumPrice">Preço Mínimo (USD) *</Label>
                  <Input
                    id="minimumPrice"
                    type="number"
                    step="0.01"
                    min={0.01}
                    placeholder="Ex: 150.00"
                    value={formEntrega.minimumPrice}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        minimumPrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDeadline">Prazo de Entrega (dias) *</Label>
                  <Input
                    id="deliveryDeadline"
                    type="number"
                    placeholder="Ex: 30"
                    min={1}
                    value={formEntrega.deliveryDeadline}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        deliveryDeadline: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    id="activeEntrega"
                    checked={formEntrega.active}
                    onCheckedChange={(checked) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        active: checked,
                      }))
                    }
                  />
                  <Label htmlFor="activeEntrega">Rota ativa</Label>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Produto
                </div>
                <p className="text-xs text-muted-foreground">
                  {produtosLoading ? "Carregando produtos…" : "Produto ao qual este frete se aplica"}
                </p>

                <div className="space-y-2">
                  <Label>Produto *</Label>
                  <SearchableSelect
                    className="space-y-0"
                    items={productItems}
                    value={formEntrega.productId}
                    onValueChange={(productId) =>
                      setFormEntrega((prev) => ({ ...prev, productId: productId }))
                    }
                    placeholder="Selecione o produto"
                    searchPlaceholder="Buscar produto..."
                    emptyMessage="Nenhum produto encontrado."
                    triggerClassName="bg-background w-full"
                    itemIcon={Package}
                    disabled={produtosLoading}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onCloseEntrega}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] sm:w-auto"
              >
                Cadastrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEntregaDialogOpen} onOpenChange={onOpenChangeEditEntrega}>
        <DialogContent className={dialogShellClass}>
          <DialogHeader>
            <DialogTitle>Editar Preço de Entrega</DialogTitle>
            <DialogDescription>
              Atualize a rota e o produto vinculado ao frete
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Rota
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editMinimumPrice">Preço Mínimo (USD) *</Label>
                  <Input
                    id="editMinimumPrice"
                    type="number"
                    step="0.01"
                    min={0.01}
                    placeholder="Ex: 150.00"
                    value={formEntrega.minimumPrice}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        minimumPrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDeliveryDeadline">Prazo de Entrega (dias) *</Label>
                  <Input
                    id="editDeliveryDeadline"
                    type="number"
                    placeholder="Ex: 30"
                    min={1}
                    value={formEntrega.deliveryDeadline}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        deliveryDeadline: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    id="editActive"
                    checked={formEntrega.active}
                    onCheckedChange={(checked) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        active: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="editActive">Rota ativa</Label>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Produto
                </div>
                <p className="text-xs text-muted-foreground">
                  {produtosLoading ? "Carregando produtos…" : "Altere o produto se necessário"}
                </p>

                <div className="space-y-2">
                  <Label>Produto *</Label>
                  <SearchableSelect
                    className="space-y-0"
                    items={productItems}
                    value={formEntrega.productId}
                    onValueChange={(productId) =>
                      setFormEntrega((prev) => ({ ...prev, productId: productId }))
                    }
                    placeholder="Selecione o produto"
                    searchPlaceholder="Buscar produto..."
                    emptyMessage="Nenhum produto encontrado."
                    triggerClassName="bg-background w-full"
                    itemIcon={Package}
                    disabled={produtosLoading}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onCloseEditEntrega}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] sm:w-auto"
              >
                Salvar alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
