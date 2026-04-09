import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Download, Filter, Plus } from 'lucide-react';

type Props = {
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  confirmEditPeriodOpen: boolean;
  setConfirmEditPeriodOpen: (value: boolean) => void;
  onConfirmEditPeriod: () => void;
  isCreatePeriodicOpen: boolean;
  setIsCreatePeriodicOpen: (value: boolean) => void;
  onOpenCreatePeriod: () => void;
  onCloseCreatePeriod: () => void;
  createPeriodContent: React.ReactNode;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  onOpenCreateAppointment: () => void;
  onCloseCreateAppointment: () => void;
  createAppointmentContent: React.ReactNode;
};

export function AppointmentsDialogs(props: Props) {
  const {
    showFilters,
    setShowFilters,
    confirmEditPeriodOpen,
    setConfirmEditPeriodOpen,
    onConfirmEditPeriod,
    isCreatePeriodicOpen,
    setIsCreatePeriodicOpen,
    onOpenCreatePeriod,
    onCloseCreatePeriod,
    createPeriodContent,
    isDialogOpen,
    setIsDialogOpen,
    onOpenCreateAppointment,
    onCloseCreateAppointment,
    createAppointmentContent,
  } = props;

  return (
    <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
      <Button
        variant={showFilters ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full sm:w-auto"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros
      </Button>
      <Button variant="outline" size="sm" className="w-full sm:w-auto">
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>

      <AlertDialog open={confirmEditPeriodOpen} onOpenChange={setConfirmEditPeriodOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alterações no período?</AlertDialogTitle>
            <AlertDialogDescription>
              Os agendamentos vinculados a este período serão realocados: ficarão sem data de coleta definida, mas continuarão dentro do período e poderão ser reagendados no novo intervalo. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmEditPeriod}>
              Confirmar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isCreatePeriodicOpen}
        onOpenChange={(open) => {
          setIsCreatePeriodicOpen(open);
          if (open) onOpenCreatePeriod();
          else onCloseCreatePeriod();
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="col-span-2 w-full sm:w-auto sm:col-span-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Período de Coleta
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Novo Período</DialogTitle>
            <DialogDescription>
              Crie um novo período de coleta de caixas
            </DialogDescription>
          </DialogHeader>
          {createPeriodContent}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (open) onOpenCreateAppointment();
          else onCloseCreateAppointment();
        }}
      >
        <DialogTrigger asChild>
          <Button className="col-span-2 w-full sm:w-auto sm:col-span-1">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Agende uma coleta de caixas
            </DialogDescription>
          </DialogHeader>
          {createAppointmentContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}
