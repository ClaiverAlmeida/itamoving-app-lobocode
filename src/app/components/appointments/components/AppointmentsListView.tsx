import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Appointment } from '../../../api';
import { AppointmentListItemCard } from './AppointmentListItemCard';

type StatusConfig = {
  label: string;
  color: string;
  textColor: string;
  bgLight: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Props = {
  viewMode: 'calendar' | 'list' | 'timeline';
  filteredAgendamentos: Appointment[];
  renderedAgendamentosList: Appointment[];
  sortedFilteredAgendamentos: Appointment[];
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  listVisibleCount: number;
  setListVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  setSelectedAgendamento: (a: Appointment) => void;
  setIsSidePanelOpen: (open: boolean) => void;
  getStatusConfig: (status: string) => StatusConfig;
  getStatusKey: (status: string) => string;
};

export function AppointmentsListView(props: Props) {
  const {
    viewMode,
    filteredAgendamentos,
    renderedAgendamentosList,
    sortedFilteredAgendamentos,
    listContainerRef,
    listVisibleCount,
    setListVisibleCount,
    setSelectedAgendamento,
    setIsSidePanelOpen,
    getStatusConfig,
    getStatusKey,
  } = props;

  if (viewMode !== 'list') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Agendamentos</CardTitle>
        <CardDescription>
          {filteredAgendamentos.length} agendamento(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={listContainerRef}
          className="space-y-3 max-h-[72vh] overflow-y-auto pr-1"
          onScroll={(e) => {
            const el = e.currentTarget;
            const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 160;
            if (nearBottom && listVisibleCount < sortedFilteredAgendamentos.length) {
              setListVisibleCount((prev) =>
                Math.min(prev + 30, sortedFilteredAgendamentos.length),
              );
            }
          }}
        >
          {renderedAgendamentosList.map((agendamento) => (
            <AppointmentListItemCard
              key={agendamento.id}
              agendamento={agendamento}
              getStatusConfig={getStatusConfig}
              getStatusKey={getStatusKey}
              onOpenDetails={(item) => {
                setSelectedAgendamento(item);
                setIsSidePanelOpen(true);
              }}
            />
          ))}

          {listVisibleCount < sortedFilteredAgendamentos.length && (
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setListVisibleCount((prev) =>
                    Math.min(prev + 30, sortedFilteredAgendamentos.length),
                  )
                }
              >
                Carregar mais
              </Button>
            </div>
          )}

          {filteredAgendamentos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
