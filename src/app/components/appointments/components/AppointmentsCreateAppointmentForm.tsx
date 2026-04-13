import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Appointment, Client, Container, CreateAppointmentsPeriodsDTO } from "../../../api";
import { AtendenteSelect, SearchableSelect } from "../../forms";
import { AppointmentBoxesPerDayAlert, AppointmentBoxesPerPeriodAlert, EmptyStateAlert } from "../../alerts";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { CalendarRange, Package, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { formatClienteAgendamentoLabel } from "../../clients/clients.display";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { formatDateOnlyToBR, toDateOnly, toDateOnlyInAppTimeZone } from "../../../utils";
import { getContainerStatusLabel } from "../../containers/containers.utils";

type FormData = {
  clientId: string;
  collectionDate: string;
  collectionTime: string;
  value: number | "";
  isPeriodic: boolean;
  downPayment: number | "";
  qtyBoxes: number | "";
  observations: string;
  userId: string;
  status: string;
  appointmentPeriodId: string;
  containerId: string;
};

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  clientesAtivos: Client[];
  containersAtivos: Container[];
  minCollectionDateByPeriod: string | null | undefined;
  maxCollectionDateByPeriod: string | undefined;
  dataPickerBlocked: () => string;
  carregarQtdCaixasPorDia: (collectionDate: string, isPeriodic: boolean, appointmentPeriodId: string) => Promise<void>;
  setQtdCaixasPorDia: React.Dispatch<React.SetStateAction<{ collectionDate: string; qtyBoxes: number }[]>>;
  qtdCaixasPorDia: { collectionDate: string; qtyBoxes: number }[];
  periodos: CreateAppointmentsPeriodsDTO[];
  carregarPeriodosOpcoes: () => Promise<void>;
  setIsPeriodic: (value: boolean) => void;
  setQtdCaixasPorPeriodo: React.Dispatch<React.SetStateAction<{ collectionDate: string; qtyBoxes: number }[]>>;
  setSemDiaColetaNoPeriodo: React.Dispatch<React.SetStateAction<number>>;
  carregarQtdCaixasPorPeriodo: (startDate: string, endDate: string) => Promise<void>;
  qtdCaixasPorPeriodo: { collectionDate: string; qtyBoxes: number }[];
  semDiaColetaNoPeriodo: number;
  user: { id: string; nome: string } | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  resetEditForm: () => void;
  setIsDialogOpen: (value: boolean) => void;
};

export function AppointmentsCreateAppointmentForm(props: Props) {
  const NONE_CONTAINER_VALUE = "__none__";
  const {
    formData,
    setFormData,
    clientesAtivos,
    containersAtivos,
    minCollectionDateByPeriod,
    maxCollectionDateByPeriod,
    dataPickerBlocked,
    carregarQtdCaixasPorDia,
    setQtdCaixasPorDia,
    qtdCaixasPorDia,
    periodos,
    carregarPeriodosOpcoes,
    setIsPeriodic,
    setQtdCaixasPorPeriodo,
    setSemDiaColetaNoPeriodo,
    carregarQtdCaixasPorPeriodo,
    qtdCaixasPorPeriodo,
    semDiaColetaNoPeriodo,
    user,
    handleSubmit,
    resetForm,
    resetEditForm,
    setIsDialogOpen,
  } = props;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SearchableSelect
        id="clientId"
        required
        label="Cliente *"
        items={clientesAtivos.map((cliente) => ({
          value: cliente.id,
          label: formatClienteAgendamentoLabel(cliente),
          searchValue: [cliente.id, cliente.usaName, cliente.usaPhone].filter(Boolean).join(" "),
        }))}
        value={formData.clientId}
        onValueChange={(v) => setFormData({ ...formData, clientId: v })}
        disabled={!clientesAtivos.length}
        placeholder="Selecione o cliente"
        searchPlaceholder="Buscar cliente..."
        emptyMessage="Nenhum cliente encontrado."
        itemIcon={Users}
      />

      {!clientesAtivos.length && (
        <EmptyStateAlert
          title="Nenhum cliente ativo"
          description="Não há clientes ativos para agendamento. Cadastre um cliente ou ative um existente. O campo Cliente ficará desabilitado até que exista ao menos um cliente ativo."
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="collectionDate">Data da Coleta {formData.isPeriodic ? "" : "*"}</Label>
          <Input
            id="collectionDate"
            type="date"
            min={minCollectionDateByPeriod ?? dataPickerBlocked()}
            max={maxCollectionDateByPeriod}
            value={formData.collectionDate}
            required={!formData.isPeriodic}
            onChange={(e) => {
              setFormData({ ...formData, collectionDate: e.target.value });
              void carregarQtdCaixasPorDia(e.target.value, formData.isPeriodic, formData.appointmentPeriodId);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionTime">Horário previsto</Label>
          <Input
            id="collectionTime"
            type="time"
            value={formData.collectionTime}
            onChange={(e) => setFormData({ ...formData, collectionTime: e.target.value })}
          />
        </div>
      </div>

      <AppointmentBoxesPerDayAlert
        qtdCaixasPorDia={qtdCaixasPorDia}
        collectionDate={formData.collectionDate}
        qtyAllowed={13}
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50/95 dark:bg-slate-900/70 dark:border-slate-700 px-4 py-4 mt-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="isPeriodic" className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              Período de coleta
            </Label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ative para definir um intervalo de datas recorrentes para este agendamento.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {formData.isPeriodic ? "Ativado" : "Desativado"}
            </span>
            <Switch
              id="isPeriodic"
              checked={formData.isPeriodic}
              onCheckedChange={(checked) => {
                setIsPeriodic(checked);
                void carregarQtdCaixasPorDia(formData.collectionDate, checked, checked ? formData.appointmentPeriodId : "");
                void carregarPeriodosOpcoes();
                setFormData((prev) => ({ ...prev, isPeriodic: checked, ...(checked ? {} : { appointmentPeriodId: "" }) }));
                if (!checked) {
                  setQtdCaixasPorPeriodo([]);
                  setSemDiaColetaNoPeriodo(0);
                }
              }}
            />
          </div>
        </div>

        {formData.isPeriodic && (
          periodos.length > 0 ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pt-2"
              >
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <SearchableSelect
                      id="appointmentPeriodId"
                      label="Selecione o período de coleta *"
                      items={periodos.map((period) => ({
                        value: String(period.id ?? ""),
                        label: `${period.title} - (${period.collectionArea}) : ${formatDateOnlyToBR(toDateOnly(String(period.startDate)))} - ${formatDateOnlyToBR(toDateOnly(String(period.endDate)))}`,
                        searchValue: [period.title, period.collectionArea, String(period.id ?? "")].join(" "),
                      }))}
                      value={formData.appointmentPeriodId}
                      onValueChange={(value) => {
                        setFormData((prev) => {
                          const period = periodos.find((p) => String(p.id ?? "") === String(value));
                          if (period?.startDate != null && period?.endDate != null) {
                            const startStr =
                              typeof period.startDate === "string"
                                ? period.startDate.slice(0, 10)
                                : toDateOnlyInAppTimeZone(period.startDate);
                            const endStr =
                              typeof period.endDate === "string"
                                ? period.endDate.slice(0, 10)
                                : toDateOnlyInAppTimeZone(period.endDate);
                            void carregarQtdCaixasPorDia(prev.collectionDate, prev.isPeriodic, value);
                            void carregarQtdCaixasPorPeriodo(startStr, endStr);
                          } else {
                            setQtdCaixasPorPeriodo([]);
                            setSemDiaColetaNoPeriodo(0);
                          }
                          return { ...prev, appointmentPeriodId: value };
                        });
                      }}
                      placeholder="Selecione o período de coleta"
                      searchPlaceholder="Buscar período..."
                      emptyMessage="Nenhum período encontrado."
                      triggerClassName="w-full"
                      itemIcon={CalendarRange}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="pt-2">
              <EmptyStateAlert
                title="Nenhum período de coleta encontrado"
                description="Cadastre um período de coleta para poder usar esta opção no agendamento."
              />
            </div>
          )
        )}
      </div>

      {formData.isPeriodic && periodos.length > 0 && formData.appointmentPeriodId && (
        <AppointmentBoxesPerPeriodAlert
          items={qtdCaixasPorPeriodo}
          extrasSemDiaColeta={semDiaColetaNoPeriodo}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="qtyBoxes">Quantidade de caixas *</Label>
        <Input
          id="qtyBoxes"
          type="number"
          required
          min={1}
          value={formData.qtyBoxes}
          onChange={(e) =>
            setFormData({
              ...formData,
              qtyBoxes: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Valor Total Previsto *</Label>
          <Input
            id="value"
            type="number"
            required
            min={1}
            value={formData.value}
            onChange={(e) =>
              setFormData({
                ...formData,
                value: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="downPayment">Valor do Pagamento Antecipado</Label>
          <Input
            id="downPayment"
            type="number"
            min={0.0}
            value={formData.downPayment}
            onChange={(e) =>
              setFormData({
                ...formData,
                downPayment: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <AtendenteSelect
        user={user}
        value={formData.userId}
        onValueChange={(id) => setFormData({ ...formData, userId: id })}
        label="Atendente *"
        required
      />

      <SearchableSelect
        id="containerId"
        label="Associação ao Container"
        items={containersAtivos.map((container) => ({
          value: container.id!,
          label: `${container.number} - ${container.type} - Letra: ${container.volumeLetter ?? "N/A"} - Status: ${getContainerStatusLabel(container.status)}`,
          searchValue: [container.number, container.type, container.volumeLetter, container.id].filter(Boolean).join(" "),
        }))}
        emptyOption={{
          value: NONE_CONTAINER_VALUE,
          label: "Nenhum container selecionado",
        }}
        value={formData.containerId || NONE_CONTAINER_VALUE}
        onValueChange={(value) =>
          setFormData({ ...formData, containerId: value === NONE_CONTAINER_VALUE ? "" : value })
        }
        disabled={!containersAtivos.length}
        placeholder="Selecione o container"
        searchPlaceholder="Buscar container..."
        emptyMessage="Nenhum container encontrado."
        itemIcon={Package}
      />

      <div className="space-y-2">
        <Label htmlFor="setStatus">Status *</Label>
        <Select
          required
          value={formData.status || undefined}
          onValueChange={(value) => {
            setFormData({ ...formData, status: value as Appointment["status"] });
          }}
        >
          <SelectTrigger id="setStatus" required aria-required>
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

      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Informações adicionais..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            resetEditForm();
            setIsDialogOpen(false);
            setIsPeriodic(false);
            setQtdCaixasPorDia([]);
            setQtdCaixasPorPeriodo([]);
            setSemDiaColetaNoPeriodo(0);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">Agendar</Button>
      </div>
    </form>
  );
}
