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
import type { DeliveryPriceForm } from "../delivery-prices.types";
import { BRASIL_STATES, EUA_STATES } from "../../../../utils";

export type DeliveryPricesDialogsProps = {
  isEntregaDialogOpen: boolean;
  onOpenChangeEntrega: (open: boolean) => void;
  onCloseEntrega: () => void;

  isEditEntregaDialogOpen: boolean;
  onOpenChangeEditEntrega: (open: boolean) => void;
  onCloseEditEntrega: () => void;

  formEntrega: DeliveryPriceForm;
  setFormEntrega: React.Dispatch<React.SetStateAction<DeliveryPriceForm>>;

  onSubmitCreate: (e: React.FormEvent) => void | Promise<void>;
  onSubmitEdit: (e: React.FormEvent) => void | Promise<void>;
};

export function DeliveryPricesDialogs(props: DeliveryPricesDialogsProps) {
  const {
    isEntregaDialogOpen,
    onOpenChangeEntrega,
    onCloseEntrega,
    isEditEntregaDialogOpen,
    onOpenChangeEditEntrega,
    onCloseEditEntrega,
    formEntrega,
    setFormEntrega,
    onSubmitCreate,
    onSubmitEdit,
  } = props;

  return (
    <>
      <Dialog open={isEntregaDialogOpen} onOpenChange={onOpenChangeEntrega}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Preço de Entrega</DialogTitle>
            <DialogDescription>
              Configure o preço de frete entre uma origem e destino
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Origem (EUA)</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originCity">Cidade *</Label>
                <Input
                  id="originCity"
                  placeholder="Ex: Miami"
                  value={formEntrega.originCity}
                  onChange={(e) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      originCity: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originState">Estado *</Label>
                <Select
                  value={formEntrega.originState}
                  onValueChange={(value) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      originState: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado dos EUA" />
                  </SelectTrigger>
                  <SelectContent>
                    {EUA_STATES.map(({ uf, nome }) => (
                      <SelectItem key={uf} value={uf}>
                        {uf} – {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Destino (Brasil)</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationCity">Cidade *</Label>
                <Input
                  id="destinationCity"
                  placeholder="Ex: São Paulo"
                  value={formEntrega.destinationCity}
                  onChange={(e) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      destinationCity: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationState">Estado *</Label>
                <Select
                  value={formEntrega.destinationState}
                  onValueChange={(value) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      destinationState: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado do Brasil" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRASIL_STATES.map(({ uf, nome }) => (
                      <SelectItem key={uf} value={uf}>
                        {uf} - {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Preços e Prazo</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Preço por Kg (USD) *</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="Ex: 8.50"
                  value={formEntrega.pricePerKg}
                  onChange={(e) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      pricePerKg: e.target.value,
                    }))
                  }
                  required
                />
              </div>

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

              <div className="col-span-1 sm:col-span-2 flex items-center gap-2 pt-1">
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
                <Label htmlFor="activeEntrega">Rota Ativa</Label>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
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
                className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] w-full sm:w-auto"
              >
                Cadastrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEntregaDialogOpen} onOpenChange={onOpenChangeEditEntrega}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Preço de Entrega</DialogTitle>
            <DialogDescription>
              Atualize as informações do preço de frete
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Origem (EUA)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOriginCity">Cidade *</Label>
                <Input
                  id="editOriginCity"
                  placeholder="Ex: Miami"
                  value={formEntrega.originCity}
                  onChange={(e) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      originCity: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOriginState">Estado *</Label>
                <Select
                  value={formEntrega.originState}
                  onValueChange={(value) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      originState: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado dos EUA" />
                  </SelectTrigger>
                  <SelectContent>
                    {EUA_STATES.map(({ uf, nome }) => (
                      <SelectItem key={uf} value={uf}>
                        {uf} - {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Destino (Brasil)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDestinationCity">Cidade *</Label>
                <Input
                  id="editDestinationCity"
                  placeholder="Ex: São Paulo"
                  value={formEntrega.destinationCity}
                  onChange={(e) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      destinationCity: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDestinationState">Estado *</Label>
                <Select
                  value={formEntrega.destinationState}
                  onValueChange={(value) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      destinationState: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado do Brasil" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRASIL_STATES.map(({ uf, nome }) => (
                      <SelectItem key={uf} value={uf}>
                        {uf} - {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label className="text-base font-semibold">Preços e Prazo</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrecoPorKg">Preço por Kg (USD) *</Label>
                <Input
                  id="editPrecoPorKg"
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="Ex: 8.50"
                  value={formEntrega.pricePerKg}
                  onChange={(e) =>
                    setFormEntrega((prev) => ({
                      ...prev,
                      pricePerKg: e.target.value,
                    }))
                  }
                  required
                />
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

              <div className="col-span-1 sm:col-span-2 flex items-center gap-2 pt-1">
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
                <Label htmlFor="editActive">Rota Ativa</Label>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
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
                className="bg-gradient-to-r from-[#1E3A5F] to-[#5DADE2] w-full sm:w-auto"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

