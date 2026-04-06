import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Switch } from "../../../ui/switch";
import type { ProductPriceForm, ProductPriceType } from "../products-prices.types";

export type ProductsPricesDialogsProps = {
  isProdutoDialogOpen: boolean;
  onOpenChangeProduto: (open: boolean) => void;
  onCloseProduto: () => void;
  isEditProdutoDialogOpen: boolean;
  onOpenChangeEditProduto: (open: boolean) => void;
  onCloseEditProduto: () => void;

  formProduto: ProductPriceForm;
  setFormProduto: React.Dispatch<React.SetStateAction<ProductPriceForm>>;

  onSubmitCreate: (e: React.FormEvent) => void | Promise<void>;
  onSubmitEdit: (e: React.FormEvent) => void | Promise<void>;
};

function isBoxType(type: ProductPriceType) {
  return (
    type === "SMALL_BOX" ||
    type === "MEDIUM_BOX" ||
    type === "LARGE_BOX" ||
    type === "PERSONALIZED_ITEM"
  );
}

export function ProductsPricesDialogs(props: ProductsPricesDialogsProps) {
  const {
    isProdutoDialogOpen,
    onOpenChangeProduto,
    onCloseProduto,
    isEditProdutoDialogOpen,
    onOpenChangeEditProduto,
    onCloseEditProduto,
    formProduto,
    setFormProduto,
    onSubmitCreate,
    onSubmitEdit,
  } = props;

  return (
    <>
      <Dialog open={isProdutoDialogOpen} onOpenChange={onOpenChangeProduto}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Cadastre um novo produto (caixa ou fita)
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 min-h-0 pr-1 -mx-1">
            <form onSubmit={onSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formProduto.type}
                    onValueChange={(value) => {
                      const nextType = value as ProductPriceType;
                      setFormProduto((prev) => ({
                        ...prev,
                        type: nextType,
                        ...(nextType === "TAPE_ADHESIVE"
                          ? { dimensions: undefined, maxWeight: undefined }
                          : {}),
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMALL_BOX">Caixa Pequena</SelectItem>
                      <SelectItem value="MEDIUM_BOX">Caixa Média</SelectItem>
                      <SelectItem value="LARGE_BOX">Caixa Grande</SelectItem>
                      <SelectItem value="PERSONALIZED_ITEM">
                        Item Personalizado
                      </SelectItem>
                      <SelectItem value="TAPE_ADHESIVE">Fita Adesiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Caixa Grande"
                    value={formProduto.name}
                    onChange={(e) =>
                      setFormProduto((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                {isBoxType(formProduto.type) && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dimensoes">Dimensões</Label>
                      <Input
                        id="dimensoes"
                        placeholder="Ex: 40 x 30 x 25 (pol)"
                        value={formProduto.dimensions ?? ""}
                        onChange={(e) =>
                          setFormProduto((prev) => ({
                            ...prev,
                            dimensions: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pesoMaximo">Peso Máximo (kg)</Label>
                      <Input
                        id="pesoMaximo"
                        type="number"
                        placeholder="Ex: 30"
                        value={formProduto.maxWeight ?? ""}
                        onChange={(e) =>
                          setFormProduto((prev) => ({
                            ...prev,
                            maxWeight: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label className="text-base font-semibold">Preços</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoCusto">Preço de Custo (USD) *</Label>
                  <Input
                    id="precoCusto"
                    type="number"
                    step="0.01"
                    min={0.00}
                    placeholder="Ex: 5.00"
                    value={formProduto.costPrice}
                    onChange={(e) =>
                      setFormProduto((prev) => ({
                        ...prev,
                        costPrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoVenda">Preço de Venda (USD) *</Label>
                  <Input
                    id="precoVenda"
                    type="number"
                    step="0.01"
                    min={0.00}
                    placeholder="Ex: 10.00"
                    value={formProduto.salePrice}
                    onChange={(e) =>
                      setFormProduto((prev) => ({
                        ...prev,
                        salePrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="precoVariavel"
                      checked={formProduto.variablePrice || false}
                      onCheckedChange={(checked) =>
                        setFormProduto((prev) => ({
                          ...prev,
                          variablePrice: checked,
                        }))
                      }
                    />
                    <Label htmlFor="precoVariavel">Preço Variável</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="ativoProduto"
                      checked={formProduto.active}
                      onCheckedChange={(checked) =>
                        setFormProduto((prev) => ({ ...prev, active: checked }))
                      }
                    />
                    <Label htmlFor="ativoProduto">Produto Ativo</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={onCloseProduto}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F] w-full sm:w-auto"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditProdutoDialogOpen}
        onOpenChange={onOpenChangeEditProduto}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 min-h-0 pr-1 -mx-1">
            <form onSubmit={onSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTipo">Tipo *</Label>
                  <Select
                    value={formProduto.type}
                    onValueChange={(value) => {
                      const nextType = value as ProductPriceType;
                      setFormProduto((prev) => ({
                        ...prev,
                        type: nextType,
                        ...(nextType === "TAPE_ADHESIVE"
                          ? { dimensions: undefined, maxWeight: undefined }
                          : {}),
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMALL_BOX">Caixa Pequena</SelectItem>
                      <SelectItem value="MEDIUM_BOX">Caixa Média</SelectItem>
                      <SelectItem value="LARGE_BOX">Caixa Grande</SelectItem>
                      <SelectItem value="PERSONALIZED_ITEM">
                        Item Personalizado
                      </SelectItem>
                      <SelectItem value="TAPE_ADHESIVE">Fita Adesiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editNome">Nome do Produto *</Label>
                  <Input
                    id="editNome"
                    placeholder="Ex: Caixa Grande"
                    value={formProduto.name}
                    onChange={(e) =>
                      setFormProduto((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                {isBoxType(formProduto.type) && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="editDimensions">Dimensões</Label>
                      <Input
                        id="editDimensions"
                        placeholder="Ex: 40x30x25cm"
                        value={formProduto.dimensions ?? ""}
                        onChange={(e) =>
                          setFormProduto((prev) => ({
                            ...prev,
                            dimensions: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editMaxWeight">Peso Máximo (kg)</Label>
                      <Input
                        id="editMaxWeight"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 30"
                        value={formProduto.maxWeight ?? ""}
                        onChange={(e) =>
                          setFormProduto((prev) => ({
                            ...prev,
                            maxWeight: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label className="text-base font-semibold">Preços</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPrecoCusto">Preço de Custo (USD) *</Label>
                  <Input
                    id="editPrecoCusto"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5.00"
                    value={formProduto.costPrice}
                    onChange={(e) =>
                      setFormProduto((prev) => ({
                        ...prev,
                        costPrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSalePrice">Preço de Venda (USD) *</Label>
                  <Input
                    id="editSalePrice"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10.00"
                    value={formProduto.salePrice}
                    onChange={(e) =>
                      setFormProduto((prev) => ({
                        ...prev,
                        salePrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="editVariablePrice"
                      checked={formProduto.variablePrice || false}
                      onCheckedChange={(checked) =>
                        setFormProduto((prev) => ({
                          ...prev,
                          variablePrice: checked,
                        }))
                      }
                    />
                    <Label htmlFor="editVariablePrice">Preço Variável</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="editActiveProduto"
                      checked={formProduto.active}
                      onCheckedChange={(checked) =>
                        setFormProduto((prev) => ({ ...prev, active: checked }))
                      }
                    />
                    <Label htmlFor="editActiveProduto">Produto Ativo</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={onCloseEditProduto}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#F5A623] to-[#1E3A5F] w-full sm:w-auto"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

