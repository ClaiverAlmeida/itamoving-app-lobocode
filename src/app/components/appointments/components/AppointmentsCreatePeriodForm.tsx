import React from "react";
import { Button } from "../../ui/button";
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
  formDataPeriod: PeriodFormData;
  setFormDataPeriod: React.Dispatch<React.SetStateAction<PeriodFormData>>;
  handleCreatePeriodic: (e: React.FormEvent) => Promise<void>;
  dataPickerBlocked: () => string;
  resetFormPeriod: () => void;
  setIsCreatePeriodicOpen: (open: boolean) => void;
};

export function AppointmentsCreatePeriodForm({
  formDataPeriod,
  setFormDataPeriod,
  handleCreatePeriodic,
  dataPickerBlocked,
  resetFormPeriod,
  setIsCreatePeriodicOpen,
}: Props) {
  return (
    <form onSubmit={handleCreatePeriodic} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titulo *</Label>
        <Input
          id="title"
          type="text"
          value={formDataPeriod.title}
          onChange={(e) => {
            setFormDataPeriod({ ...formDataPeriod, title: e.target.value });
          }}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Inicio *</Label>
          <Input
            id="startDate"
            type="date"
            min={dataPickerBlocked()}
            max={formDataPeriod.endDate}
            value={formDataPeriod.startDate}
            onChange={(e) => {
              setFormDataPeriod({ ...formDataPeriod, startDate: e.target.value });
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Fim *</Label>
          <Input
            id="endDate"
            type="date"
            min={formDataPeriod.startDate ? formDataPeriod.startDate : dataPickerBlocked()}
            value={formDataPeriod.endDate}
            onChange={(e) => {
              setFormDataPeriod({ ...formDataPeriod, endDate: e.target.value });
            }}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="collectionArea">Area de Coleta *</Label>
          <Input
            id="collectionArea"
            type="text"
            value={formDataPeriod.collectionArea}
            onChange={(e) => {
              setFormDataPeriod({ ...formDataPeriod, collectionArea: e.target.value });
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formDataPeriod.status}
            onValueChange={(value) => {
              setFormDataPeriod({ ...formDataPeriod, status: value });
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="COLLECTED">Coletado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observations">Observacoes</Label>
        <Textarea
          id="observations"
          value={formDataPeriod.observations}
          onChange={(e) => {
            setFormDataPeriod({ ...formDataPeriod, observations: e.target.value });
          }}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            resetFormPeriod();
            setIsCreatePeriodicOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">Criar Periodo</Button>
      </div>
    </form>
  );
}
