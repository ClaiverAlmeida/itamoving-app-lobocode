import React from "react";
import { Edit } from "lucide-react";
import type { CreateAppointmentsPeriodsDTO } from "../../../api";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";

type PeriodFormData = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  collectionArea: string;
  status: string;
  observations: string;
};

type Props = {
  periodo: CreateAppointmentsPeriodsDTO;
  isDialogEditPeriodOpen: boolean;
  selectedPeriodId?: string;
  setSelectedPeriod: (period: CreateAppointmentsPeriodsDTO | null) => void;
  fillEditFormPeriodFrom: (period: CreateAppointmentsPeriodsDTO) => void;
  resetFormPeriod: () => void;
  setIsDialogEditPeriodOpen: (open: boolean) => void;
  formDataPeriod: PeriodFormData;
  setFormDataPeriod: React.Dispatch<React.SetStateAction<PeriodFormData>>;
  dataPickerBlocked: () => string;
  handleEditPeriod: (e: React.FormEvent) => void;
};

export function AppointmentsEditPeriodDialog({
  periodo,
  isDialogEditPeriodOpen,
  selectedPeriodId,
  setSelectedPeriod,
  fillEditFormPeriodFrom,
  resetFormPeriod,
  setIsDialogEditPeriodOpen,
  formDataPeriod,
  setFormDataPeriod,
  dataPickerBlocked,
  handleEditPeriod,
}: Props) {
  return (
    <Dialog
      open={isDialogEditPeriodOpen && selectedPeriodId === periodo.id}
      onOpenChange={(open) => {
        if (open) {
          setSelectedPeriod(periodo);
          fillEditFormPeriodFrom(periodo);
          setIsDialogEditPeriodOpen(true);
        } else {
          resetFormPeriod();
          setIsDialogEditPeriodOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Editar período"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Período</DialogTitle>
          <DialogDescription>Edite as informações do período. Os agendamentos vinculados serão realocados.</DialogDescription>
        </DialogHeader>
        <form id="form-edit-period" onSubmit={handleEditPeriod}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleEdit">Título *</Label>
              <Input
                id="titleEdit"
                name="titleEdit"
                value={formDataPeriod.title}
                onChange={(e) => setFormDataPeriod({ ...formDataPeriod, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDateEdit">Data de Início *</Label>
                <Input
                  id="startDateEdit"
                  type="date"
                  min={dataPickerBlocked()}
                  max={formDataPeriod.endDate}
                  value={formDataPeriod.startDate}
                  onChange={(e) => setFormDataPeriod({ ...formDataPeriod, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDateEdit">Data de Fim *</Label>
                <Input
                  id="endDateEdit"
                  type="date"
                  min={formDataPeriod.startDate ? formDataPeriod.startDate : dataPickerBlocked()}
                  value={formDataPeriod.endDate}
                  onChange={(e) => setFormDataPeriod({ ...formDataPeriod, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collectionAreaEdit">Área de Coleta *</Label>
                <Input
                  id="collectionAreaEdit"
                  value={formDataPeriod.collectionArea}
                  onChange={(e) => setFormDataPeriod({ ...formDataPeriod, collectionArea: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observationsEdit">Status *</Label>
                <Select
                  value={formDataPeriod.status}
                  onValueChange={(value) => setFormDataPeriod({ ...formDataPeriod, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                      <SelectItem value="COLLECTED">Coletado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observationsEdit">Observações</Label>
              <Textarea
                id="observationsEdit"
                value={formDataPeriod.observations}
                onChange={(e) => setFormDataPeriod({ ...formDataPeriod, observations: e.target.value })}
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetFormPeriod();
              setIsDialogEditPeriodOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" form="form-edit-period">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

