import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import type { Container } from "../../../api";
import { sanitizeVolumeLetterInput, type ContainerFormData } from "../containers.payload";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  formData: ContainerFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContainerFormData>>;
  resetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  dataPickerBlocked: () => string;
};

export function ContainersCreateDialog({
  isOpen,
  setIsOpen,
  formData,
  setFormData,
  resetForm,
  onSubmit,
  dataPickerBlocked,
}: Props) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="col-span-2 w-full sm:w-auto sm:col-span-1">
          <Plus className="w-4 h-4 mr-2" />
          Novo Container
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[92vw] lg:w-[84vw] max-w-4xl lg:max-w-5xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Container</DialogTitle>
          <DialogDescription>Preencha os dados para registrar um novo container no sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 lg:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <div className="space-y-2">
              <Label htmlFor="create-number">Número do Container *</Label>
              <Input id="create-number" placeholder="Ex: MSKU1234567" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-seal">Lacre do Container </Label>
              <Input id="create-seal" value={formData.seal} onChange={(e) => setFormData({ ...formData, seal: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-type">Tipo de Container *</Label>
              <Input id="create-type" placeholder="Ex: C20FT" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-volumeLetter">Letra(s) do volume *</Label>
              <Input
                id="create-volumeLetter"
                className="uppercase font-mono"
                maxLength={2}
                placeholder="A, B, AA, BB, etc."
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                pattern="[A-Za-z]{1,2}"
                title="Uma ou duas letras de A a Z"
                value={formData.volumeLetter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volumeLetter: sanitizeVolumeLetterInput(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-origin">Porto de Origem *</Label>
              <Input id="create-origin" placeholder="Ex: Miami, FL - USA" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-destination">Porto de Destino *</Label>
              <Input id="create-destination" placeholder="Ex: Santos, SP - Brasil" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-boardingDate">Data de Embarque *</Label>
              <Input id="create-boardingDate" type="date" min={dataPickerBlocked()} value={formData.boardingDate} onChange={(e) => setFormData({ ...formData, boardingDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-estimatedArrival">Previsão de Chegada *</Label>
              <Input id="create-estimatedArrival" type="date" min={dataPickerBlocked()} value={formData.estimatedArrival} onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-volume">Volume (m³) *</Label>
              <Input id="create-volume" type="number" step="0.01" min="0.01" placeholder="Ex: 67.5" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-emptyWeight">Peso do container vazio (kg)</Label>
              <Input
                id="create-emptyWeight"
                type="number"
                step="0.01"
                min="0"
                placeholder="Opcional — tara"
                value={formData.emptyWeight}
                onChange={(e) => setFormData({ ...formData, emptyWeight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-fullWeight">Peso do container cheio (kg) *</Label>
              <Input
                id="create-fullWeight"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Define o limite de peso da carga"
                value={formData.fullWeight}
                onChange={(e) => setFormData({ ...formData, fullWeight: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="create-trackingLink">Link de Rastreamento</Label>
              <Input id="create-trackingLink" type="url" placeholder="Ex: https://tracking.example.com/CNT123456" className="w-full max-w-full" value={formData.trackingLink} onChange={(e) => setFormData({ ...formData, trackingLink: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-status">Status Inicial *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Container["status"] })} required>
                <SelectTrigger className="w-full max-w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREPARATION">Em Preparação</SelectItem>
                  <SelectItem value="IN_TRANSIT">Em Trânsito</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 lg:gap-3 pt-4 lg:pt-5 border-t">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { resetForm(); setIsOpen(false); }}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Cadastrar Container</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

