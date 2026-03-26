import React from "react";
import { Agendamento } from "../../../api";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Navigation, User, X } from "lucide-react";
import { StatusSelect } from "../../forms";
import { AGENDAMENTO_STATUS_ITEMS } from "../appointments.constants";
import { AppointmentsEditAppointmentDialog } from "./AppointmentsEditAppointmentDialog";

type Props = {
  ag: Agendamento;
  getStatusConfig: (status: string) => { label: string; textColor: string; bgLight: string };
  onClose: () => void;
  onDelete: (id: string, clientName: string) => void;
  onStatusChange: (id: string, value: Agendamento["status"]) => void;
  onSelectedAgendamentoChange: (ag: Agendamento) => void;
  editDialogProps: React.ComponentProps<typeof AppointmentsEditAppointmentDialog>;
};

export function AppointmentsSelectedAppointmentContent({
  ag,
  getStatusConfig,
  onClose,
  onDelete,
  onStatusChange,
  onSelectedAgendamentoChange,
  editDialogProps,
}: Props) {
  return (
    <>
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">{ag.client.name}</h2>
            <Badge className={getStatusConfig(ag.status).bgLight}>
              <span className={getStatusConfig(ag.status).textColor}>{getStatusConfig(ag.status).label}</span>
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {((): string => {
                const s = (ag.collectionDate ?? "").slice(0, 10);
                return s.length >= 10 ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : "--";
              })()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{ag.collectionTime}</span>
          </div>
        </div>
      </div>

      <AppointmentsEditAppointmentDialog {...editDialogProps} />

      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço de Coleta
          </h3>
          <p className="text-sm text-muted-foreground break-words leading-relaxed">{ag.client.usaAddress}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() =>
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ag.client.usaAddress)}`, "_blank")
            }
          >
            <Navigation className="w-4 h-4 mr-2" />
            Abrir no Google Maps
          </Button>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Atendente Responsável
          </h3>
          <p className="text-sm text-muted-foreground">{ag.user?.name}</p>
        </div>
        {ag.observations && (
          <div>
            <h3 className="font-semibold mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground italic">{ag.observations}</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-2">Quantidade de Caixas</h3>
          <p className="text-sm text-muted-foreground">{ag.qtyBoxes} Caixa(s)</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Alterar Status</h3>
          <StatusSelect
            value={ag.status}
            items={AGENDAMENTO_STATUS_ITEMS}
            onValueChange={(value) => {
              onStatusChange(ag.id!, value);
              onSelectedAgendamentoChange({ ...ag, status: value, collectionTime: ag.collectionTime ?? "" });
            }}
          />
        </div>
        <div className="space-y-2 pt-4 border-t">
          <Button variant="destructive" className="w-full" onClick={() => onDelete(ag.id!, ag.client.name)}>
            Excluir Agendamento
          </Button>
        </div>
      </div>
    </>
  );
}
