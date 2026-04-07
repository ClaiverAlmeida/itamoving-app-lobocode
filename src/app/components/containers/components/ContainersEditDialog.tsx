import React from "react";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
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
  setIsEditing: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ContainersEditDialog({
  isOpen,
  setIsOpen,
  formData,
  setFormData,
  resetForm,
  setIsEditing,
  onSubmit,
}: Props) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="w-[95vw] sm:w-[92vw] lg:w-[84vw] max-w-4xl lg:max-w-5xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Container</DialogTitle>
          <DialogDescription>Atualize os dados do container no sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 lg:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <div className="space-y-2">
              <Label htmlFor="edit-number">Número do Container *</Label>
              <Input id="edit-number" placeholder="Ex: MSKU1234567" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seal">Lacre do Container </Label>
              <Input id="edit-seal" value={formData.seal} onChange={(e) => setFormData({ ...formData, seal: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo de Container *</Label>
              <Input id="edit-type" placeholder="Ex: C20FT" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-volumeLetter">Letra(s) do volume *</Label>
              <Input
                id="edit-volumeLetter"
                className="max-w-[5rem] uppercase font-mono"
                maxLength={2}
                placeholder="A ou AA"
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
              <Label htmlFor="edit-origin">Porto de Origem *</Label>
              <Input id="edit-origin" placeholder="Ex: Miami, FL - USA" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-destination">Porto de Destino *</Label>
              <Input id="edit-destination" placeholder="Ex: Santos, SP - Brasil" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-boardingDate">Data de Embarque *</Label>
              <Input id="edit-boardingDate" type="date" value={formData.boardingDate} onChange={(e) => setFormData({ ...formData, boardingDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estimatedArrival">Previsão de Chegada *</Label>
              <Input id="edit-estimatedArrival" type="date" value={formData.estimatedArrival} onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-volume">Volume (m³) *</Label>
              <Input id="edit-volume" type="number" step="0.01" min="0.01" placeholder="Ex: 67.5" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emptyWeight">Peso do container vazio (kg)</Label>
              <Input
                id="edit-emptyWeight"
                type="number"
                step="0.01"
                min="0"
                placeholder="Opcional — tara"
                value={formData.emptyWeight}
                onChange={(e) => setFormData({ ...formData, emptyWeight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fullWeight">Peso do container cheio (kg) *</Label>
              <Input
                id="edit-fullWeight"
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
              <Label htmlFor="edit-trackingLink">Link de Rastreamento</Label>
              <Input id="edit-trackingLink" type="url" placeholder="Ex: https://tracking.example.com/CNT123456" className="w-full max-w-full" value={formData.trackingLink} onChange={(e) => setFormData({ ...formData, trackingLink: e.target.value })} />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-status">Status *</Label>
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
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { resetForm(); setIsOpen(false); setIsEditing(false); }}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Atualizar Container</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

