import { useCallback, useMemo } from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { Agendamento, CreateAppointmentsPeriodsDTO } from '../../../api';
import { isCollectionDateInPeriod, parseLocalDate, toYYYYMMDD } from '../appointments.utils';

export function useAppointmentsDateGetters(args: {
  agendamentos: Agendamento[];
  filteredAgendamentos: Agendamento[];
  selectedPeriod: CreateAppointmentsPeriodsDTO | null;
}) {
  const { agendamentos, filteredAgendamentos, selectedPeriod } = args;

  const getDateLabel = useCallback((date: Date) => {
    if (isYesterday(date)) return 'Ontem';
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  }, []);

  const getDatesWithAgendamentos = useCallback(() => {
    const seen = new Set<string>();
    return agendamentos
      .map((a) => (a.collectionDate ?? '').slice(0, 10))
      .filter((d) => d.length === 10 && !seen.has(d) && (seen.add(d), true))
      .map((d) => parseLocalDate(d));
  }, [agendamentos]);

  const getDatesWithGrupoEUnico = useCallback(() => {
    if (!selectedPeriod?.id) return [];
    const selectedPid = String(selectedPeriod.id);
    const byDate = new Map<string, { grupo: boolean; unico: boolean }>();
    agendamentos.forEach((a) => {
      const d = (a.collectionDate ?? '').slice(0, 10);
      if (d.length < 10) return;
      if (!byDate.has(d)) byDate.set(d, { grupo: false, unico: false });
      const cur = byDate.get(d)!;
      if (a.isPeriodic) {
        if (String(a.appointmentPeriodId ?? '') === selectedPid) {
          if (isCollectionDateInPeriod(d, selectedPeriod)) cur.grupo = true;
        }
      } else cur.unico = true;
    });
    return Array.from(byDate.entries())
      .filter(([, v]) => v.grupo && v.unico)
      .map(([d]) => parseLocalDate(d));
  }, [agendamentos, selectedPeriod]);

  const getDatesUnicoDentroDePeriodo = useCallback(() => {
    if (!selectedPeriod?.id) return [];
    const diasComUnico = new Set<string>();
    agendamentos.forEach((a) => {
      if (a.isPeriodic) return;
      const d = (a.collectionDate ?? '').slice(0, 10);
      if (d.length < 10) return;
      diasComUnico.add(d);
    });
    const result: Date[] = [];
    const startStr = toYYYYMMDD(selectedPeriod.startDate);
    const endStr = toYYYYMMDD(selectedPeriod.endDate);
    if (!startStr || !endStr) return [];
    diasComUnico.forEach((dayStr) => {
      if (dayStr >= startStr && dayStr <= endStr) result.push(parseLocalDate(dayStr));
    });
    const seen = new Set<string>();
    return result.filter((d) => {
      const key = format(d, 'yyyy-MM-dd');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [agendamentos, selectedPeriod]);

  const datesHalfHalfSet = useMemo(() => {
    const set = new Set<string>();
    getDatesWithGrupoEUnico().forEach((d) => set.add(format(d, 'yyyy-MM-dd')));
    getDatesUnicoDentroDePeriodo().forEach((d) => set.add(format(d, 'yyyy-MM-dd')));
    return set;
  }, [getDatesWithGrupoEUnico, getDatesUnicoDentroDePeriodo]);

  const getDatesInPeriodRange = useCallback(() => {
    if (!selectedPeriod?.startDate || !selectedPeriod?.endDate) return [];
    const start = parseLocalDate(selectedPeriod.startDate.slice(0, 10));
    const end = parseLocalDate(selectedPeriod.endDate.slice(0, 10));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
    const dates: Date[] = [];
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0, 0, 0);
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12, 0, 0, 0);
    while (d <= endDay) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [selectedPeriod?.startDate, selectedPeriod?.endDate]);

  const getDatesWithAppointmentsInPeriod = useCallback(() => {
    if (!selectedPeriod?.id) return [];
    const dateSet = new Set<string>();
    agendamentos.forEach((a) => {
      if (!a.isPeriodic) return;
      const d = (a.collectionDate ?? '').slice(0, 10);
      if (d.length !== 10) return;
      if (String(a.appointmentPeriodId ?? '') !== String(selectedPeriod.id)) return;
      if (!isCollectionDateInPeriod(d, selectedPeriod)) return;
      dateSet.add(d);
    });
    return Array.from(dateSet).map((d) => parseLocalDate(d));
  }, [agendamentos, selectedPeriod]);

  const getDatesInPeriodRangeOnlyNoHalfHalf = useCallback(
    () => getDatesInPeriodRange().filter((d) => !datesHalfHalfSet.has(format(d, 'yyyy-MM-dd'))),
    [getDatesInPeriodRange, datesHalfHalfSet],
  );

  const getDatesWithAppointmentsInPeriodNoHalfHalf = useCallback(
    () => getDatesWithAppointmentsInPeriod().filter((d) => !datesHalfHalfSet.has(format(d, 'yyyy-MM-dd'))),
    [getDatesWithAppointmentsInPeriod, datesHalfHalfSet],
  );

  const getDatesHojeComAgendamentoHalf = useCallback(() => {
    if (selectedPeriod?.id) return [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasToday = filteredAgendamentos.some((a) => (a.collectionDate ?? '').slice(0, 10) === todayStr);
    return hasToday ? [parseLocalDate(todayStr)] : [];
  }, [filteredAgendamentos, selectedPeriod?.id]);

  return {
    getDateLabel,
    getDatesWithAgendamentos,
    getDatesWithGrupoEUnico,
    getDatesUnicoDentroDePeriodo,
    getDatesInPeriodRangeOnlyNoHalfHalf,
    getDatesWithAppointmentsInPeriodNoHalfHalf,
    getDatesHojeComAgendamentoHalf,
  };
}
