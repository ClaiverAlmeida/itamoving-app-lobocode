import React from "react";
import { ClipboardList } from "lucide-react";
import type { DriverUser, DriverServiceOrder, DriverServiceOrderView } from "../../../../api";
import { ResponsavelSelect } from "../../../forms";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";

type Props = {
  isEditMode: boolean;
  existingOrdem?: DriverServiceOrderView;
  ordemStatus: DriverServiceOrder["status"];
  setOrdemStatus: (v: DriverServiceOrder["status"]) => void;
  motoristas: DriverUser[];
  motoristaResponsavel: string;
  setMotoristaResponsavel: (v: string) => void;
  isMotoristaUser: boolean;
  ordemObservacoes: string;
  setOrdemObservacoes: (v: string) => void;
  observations: string;
  setObservations: (v: string) => void;
};

export function ServiceOrderFormBackOfficeCard(props: Props) {
  const {
    isEditMode,
    existingOrdem,
    ordemStatus,
    setOrdemStatus,
    motoristas,
    motoristaResponsavel,
    setMotoristaResponsavel,
    isMotoristaUser,
    ordemObservacoes,
    setOrdemObservacoes,
    observations,
    setObservations,
  } = props;

  return (
    <Card className="border-[#1E3A5F] border-2">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/40 border-[#1E3A5F] border-0 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
          <ClipboardList className="w-5 h-5" />
          Gestao da ordem (back-office)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className={`grid grid-cols-1 gap-4 ${isEditMode ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {isEditMode ? (
            <div className="space-y-2">
              <Label htmlFor="osIdInterno">Nº da ordem</Label>
              <Input id="osIdInterno" value={existingOrdem?.id ?? ""} readOnly className="bg-muted font-mono" />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select required value={ordemStatus} onValueChange={(v: DriverServiceOrder["status"]) => setOrdemStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                <SelectItem value="COMPLETED">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <ResponsavelSelect
              items={motoristas}
              label="Motorista responsável *"
              value={motoristaResponsavel}
              onValueChange={(v: string) => setMotoristaResponsavel(v)}
              placeholder="Selecione o motorista responsável..."
              searchPlaceholder="Buscar motorista responsável..."
              emptyMessage="Nenhum motorista responsável encontrado."
              disabled={isMotoristaUser}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="obsInternas">Observações internas</Label>
          <Textarea
            id="obsInternas"
            rows={3}
            value={isEditMode ? ordemObservacoes : observations}
            onChange={(e) => (isEditMode ? setOrdemObservacoes(e.target.value) : setObservations(e.target.value))}
            placeholder="Notas visiveis apenas na gestao da ordem..."
            className="resize-y min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}

