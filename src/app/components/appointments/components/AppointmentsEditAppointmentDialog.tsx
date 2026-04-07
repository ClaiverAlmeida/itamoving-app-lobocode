import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Appointment, Client, Container, CreateAppointmentsPeriodsDTO } from "../../../api";
import { AtendenteSelect } from "../../forms";
import { AppointmentBoxesPerDayAlert, AppointmentBoxesPerPeriodAlert, EmptyStateAlert } from "../../alerts";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Edit } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { formatClienteAgendamentoLabel } from "../../clients/clients.display";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { formatDateOnlyToBR, toDateOnly } from "../../../utils";
import { getContainerStatusLabel } from "../../containers/containers.utils";

type FormData = {
  clientId: string;
  collectionDate: string;
  collectionTime: string;
  value: number;
  downPayment: number;
  isPeriodic: boolean;
  qtyBoxes: number;
  observations: string;
  userId: string;
  status: string;
  appointmentPeriodId: string;
  containerId: string;
};

type Props = {
  ag: Appointment;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  carregarClientes: () => Promise<void>;
  carregarContainers: () => Promise<void>;
  fillEditFormFromSelected: () => void;
  resetForm: () => void;
  setIsPeriodic: (value: boolean) => void;
  setQtdCaixasPorDia: React.Dispatch<React.SetStateAction<{ collectionDate: string; qtyBoxes: number }[]>>;
  setQtdCaixasPorPeriodo: React.Dispatch<React.SetStateAction<{ collectionDate: string; qtyBoxes: number }[]>>;
  setSemDiaColetaNoPeriodo: React.Dispatch<React.SetStateAction<number>>;
  handleEditAgendamento: (e: React.FormEvent, agendamento: Appointment) => Promise<void>;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  clientesAtivos: Client[];
  containersAtivos: Container[];
  minCollectionDateByPeriod: string | null | undefined;
  maxCollectionDateByPeriod: string | undefined;
  carregarQtdCaixasPorDia: (collectionDate: string, isPeriodic: boolean, appointmentPeriodId: string) => Promise<void>;
  qtdCaixasPorDia: { collectionDate: string; qtyBoxes: number }[];
  periodos: CreateAppointmentsPeriodsDTO[];
  carregarPeriodosOpcoes: () => Promise<void>;
  carregarQtdCaixasPorPeriodo: (startDate: string, endDate: string) => Promise<void>;
  qtdCaixasPorPeriodo: { collectionDate: string; qtyBoxes: number }[];
  semDiaColetaNoPeriodo: number;
  user: { id: string; nome: string } | null;
};

export function AppointmentsEditAppointmentDialog(props: Props) {
  const NONE_CONTAINER_VALUE = "__none__";
  const {
    ag,
    isEditDialogOpen,
    setIsEditDialogOpen,
    carregarClientes,
    carregarContainers,
    fillEditFormFromSelected,
    resetForm,
    setIsPeriodic,
    setQtdCaixasPorDia,
    setQtdCaixasPorPeriodo,
    setSemDiaColetaNoPeriodo,
    handleEditAgendamento,
    formData,
    setFormData,
    clientesAtivos,
    containersAtivos,
    minCollectionDateByPeriod,
    maxCollectionDateByPeriod,
    carregarQtdCaixasPorDia,
    qtdCaixasPorDia,
    periodos,
    carregarPeriodosOpcoes,
    carregarQtdCaixasPorPeriodo,
    qtdCaixasPorPeriodo,
    semDiaColetaNoPeriodo,
    user,
  } = props;

  return (
    <Dialog
      open={isEditDialogOpen}
      onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        void carregarClientes();
        void carregarContainers();
        if (open && ag) fillEditFormFromSelected();
        if (!open) {
          resetForm();
          setIsPeriodic(false);
          setQtdCaixasPorDia([]);
          setQtdCaixasPorPeriodo([]);
          setSemDiaColetaNoPeriodo(0);
        }
      }}
    >
      <div className="mt-7 flex w-full justify-center px-6">
        <DialogTrigger asChild>
          <Button variant="outline" className="w-[95%] max-w-md shrink-0">
            <Edit className="w-4 h-4 mr-2" />
            Editar agendamento
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>Altere os dados da coleta de caixas</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleEditAgendamento(e, ag)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editFormClientId">Cliente *</Label>
            <Select
              value={formData.clientId}
              disabled={!clientesAtivos.length}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              required
            >
              <SelectTrigger id="editFormClientId">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientesAtivos.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {formatClienteAgendamentoLabel(cliente)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!clientesAtivos.length && (
            <EmptyStateAlert
              title="Nenhum cliente ativo"
              description="Não há clientes ativos para agendamento. Cadastre um cliente ou ative um existente. O campo Cliente ficará desabilitado até que exista ao menos um cliente ativo."
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFormCollectionDate">Data da Coleta {formData.isPeriodic ? "" : "*"}</Label>
              <Input
                id="editFormCollectionDate"
                type="date"
                min={minCollectionDateByPeriod ?? undefined}
                max={maxCollectionDateByPeriod}
                value={formData.collectionDate}
                required={!formData.isPeriodic}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, collectionDate: value });
                  if (value) void carregarQtdCaixasPorDia(value, formData.isPeriodic, formData.appointmentPeriodId);
                  else setQtdCaixasPorDia([]);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editFormCollectionTime">Horário previsto</Label>
              <Input
                id="editFormCollectionTime"
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
                <Label htmlFor="editFormIsPeriodic" className="text-xs font-semibold text-slate-900 dark:text-slate-50">
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
                  id="editFormIsPeriodic"
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
                        <Label htmlFor="editFormAppointmentPeriodId">Selecione o período de coleta *</Label>
                        <Select
                          value={formData.appointmentPeriodId}
                          onValueChange={(value) => {
                            setFormData((prev) => {
                              const period = periodos.find((p) => String(p.id ?? "") === String(value));
                              if (period?.startDate != null && period?.endDate != null) {
                                const startStr =
                                  typeof period.startDate === "string"
                                    ? period.startDate.slice(0, 10)
                                    : new Date(period.startDate).toISOString().slice(0, 10);
                                const endStr =
                                  typeof period.endDate === "string"
                                    ? period.endDate.slice(0, 10)
                                    : new Date(period.endDate).toISOString().slice(0, 10);
                                void carregarQtdCaixasPorDia(prev.collectionDate, prev.isPeriodic, value);
                                void carregarQtdCaixasPorPeriodo(startStr, endStr);
                              } else {
                                setQtdCaixasPorPeriodo([]);
                                setSemDiaColetaNoPeriodo(0);
                              }
                              return { ...prev, appointmentPeriodId: value };
                            });
                          }}
                        >
                          <SelectTrigger id="editFormAppointmentPeriodId" className="w-full">
                            <SelectValue placeholder="Selecione o período de coleta" />
                          </SelectTrigger>
                          <SelectContent>
                            {periodos.map((period) => (
                              <SelectItem key={period.id ?? ""} value={period.id ?? ""}>
                                {period.title} - ({period.collectionArea}) : {formatDateOnlyToBR(toDateOnly(String(period.startDate)))} - {formatDateOnlyToBR(toDateOnly(String(period.endDate)))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
            <Label htmlFor="editFormQtyBoxes">Quantidade de caixas *</Label>
            <Input
              id="editFormQtyBoxes"
              type="number"
              required
              min={1}
              value={formData.qtyBoxes}
              onChange={(e) => setFormData({ ...formData, qtyBoxes: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFormValue">Valor Total *</Label>
              <Input
                id="editFormValue"
                type="number"
                required
                min={1}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFormDownPayment">Valor do Pagamento Antecipado</Label>
              <Input
                id="editFormDownPayment"
                type="number"
                min={0.0}
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
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

          <div className="space-y-2">
            <Label htmlFor="editFormContainerId">Container</Label>
            <Select
              value={formData.containerId || NONE_CONTAINER_VALUE}
              disabled={!containersAtivos.length}
              onValueChange={(value) =>
                setFormData({ ...formData, containerId: value === NONE_CONTAINER_VALUE ? "" : value })
              }
            >
              <SelectTrigger id="editFormContainerId">
                <SelectValue placeholder="Selecione o container" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_CONTAINER_VALUE}>Nenhum container selecionado</SelectItem>
                {containersAtivos.map((container) => (
                  <SelectItem key={container.id!} value={container.id!}>
                    {container.number} - {container.type} - Letra: {container.volumeLetter ?? "N/A"} - Status: {getContainerStatusLabel(container.status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editFormSetStatus">Status *</Label>
            <Select
              required
              value={formData.status || undefined}
              onValueChange={(value) => {
                setFormData({ ...formData, status: value as Appointment["status"] });
              }}
            >
              <SelectTrigger id="editFormSetStatus" required aria-required>
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
            <Label htmlFor="editFormObservations">Observações</Label>
            <Textarea
              id="editFormObservations"
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
                setIsPeriodic(false);
                setQtdCaixasPorDia([]);
                setQtdCaixasPorPeriodo([]);
                setSemDiaColetaNoPeriodo(0);
                setIsEditDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
