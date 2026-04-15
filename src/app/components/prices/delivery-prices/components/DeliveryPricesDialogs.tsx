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

/** Valor do SearchableSelect para “sem produto” (payload trata como vazio → omit no POST / `null` no PATCH). */
const NONE_PRODUCT_SELECT_VALUE = "";

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
                  Frete
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total do frete, prazo, frete ativo e se o frete é variável
                </p>

                <div className="space-y-2">
                  <Label htmlFor="routeName">Nome do Frete *</Label>
                  <Input
                    id="routeName"
                    type="text"
                    placeholder="Ex: Frete 1"
                    value={formEntrega.routeName}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        routeName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPrice">Valor Total Frete (USD) *</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    step="0.01"
                    min={0.01}
                    placeholder="Ex: 150.00"
                    value={formEntrega.totalPrice}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        totalPrice: e.target.value,
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

                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2">
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
                    <Label htmlFor="activeEntrega">Frete ativo</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isVariableDeliveryPrice"
                      checked={formEntrega.isVariablePrice ?? false}
                      onCheckedChange={(checked) =>
                        setFormEntrega((prev) => ({
                          ...prev,
                          isVariablePrice: checked,
                        }))
                      }
                    />
                    <Label htmlFor="isVariableDeliveryPrice">Frete variável</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Produto
                </div>
                <p className="text-xs text-muted-foreground">
                  {produtosLoading ? "Carregando produtos…" : "Produto ao qual este frete se aplica (opcional)"}
                </p>

                <div className="space-y-2">
                  <Label>Produto</Label>
                  <SearchableSelect
                    className="space-y-0"
                    items={productItems}
                    value={formEntrega.productId ?? undefined}
                    onValueChange={(productId) =>
                      setFormEntrega((prev) => ({ ...prev, productId: productId }))
                    }
                    emptyOption={{
                      value: NONE_PRODUCT_SELECT_VALUE,
                      label: "Nenhum produto",
                    }}
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
              Configure a rota (valores e prazo) e o produto vinculado ao frete
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Frete
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total do frete, prazo, rota ativa e se o frete é variável
                </p>

                <div className="space-y-2">
                  <Label htmlFor="editRouteName">Nome do Frete *</Label>
                  <Input
                    id="editRouteName"
                    type="text"
                    placeholder="Ex: Frete 1"
                    value={formEntrega.routeName}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        routeName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editTotalPrice">Valor Total Frete (USD) *</Label>
                  <Input
                    id="editTotalPrice"
                    type="number"
                    step="0.01"
                    min={0.01}
                    placeholder="Ex: 150.00"
                    value={formEntrega.totalPrice}
                    onChange={(e) =>
                      setFormEntrega((prev) => ({
                        ...prev,
                        totalPrice: e.target.value,
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

                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="editActiveEntrega"
                      checked={formEntrega.active}
                      onCheckedChange={(checked) =>
                        setFormEntrega((prev) => ({
                          ...prev,
                          active: checked,
                        }))
                      }
                    />
                    <Label htmlFor="editActiveEntrega">Frete ativo</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="editIsVariableDeliveryPrice"
                      checked={formEntrega.isVariablePrice ?? false}
                      onCheckedChange={(checked) =>
                        setFormEntrega((prev) => ({
                          ...prev,
                          isVariablePrice: checked,
                        }))
                      }
                    />
                    <Label htmlFor="editIsVariableDeliveryPrice">Frete variável</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4 shrink-0 text-[#1E3A5F]" />
                  Produto
                </div>
                <p className="text-xs text-muted-foreground">
                  {produtosLoading ? "Carregando produtos…" : "Produto ao qual este frete se aplica (opcional)"}
                </p>

                <div className="space-y-2">
                  <Label>Produto</Label>
                  <SearchableSelect
                    className="space-y-0"
                    items={productItems}
                    value={formEntrega.productId ?? undefined}
                    onValueChange={(productId) =>
                      setFormEntrega((prev) => ({ ...prev, productId: productId }))
                    }
                    emptyOption={{
                      value: NONE_PRODUCT_SELECT_VALUE,
                      label: "Nenhum produto",
                    }}
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
