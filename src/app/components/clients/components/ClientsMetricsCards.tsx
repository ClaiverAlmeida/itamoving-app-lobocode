import React from 'react';
import { Card } from '../../ui/card';
import { Building, Flag, TrendingUp, Users as UsersIcon } from 'lucide-react';

/** Dados agregados da lista de clientes (normalmente derivados de `filteredClientes`). */
export type ClientsStatistics = {
  total: number;
  novosUltimaSemana: number;
  estadosUsa: number;
  cidadesUsa: number;
  estadosBrasil: number;
  cidadesBrasil: number;
};

type Props = {
  statistics: ClientsStatistics;
};

function DualMetricCard({
  title,
  icon: Icon,
  leftValue,
  leftLabel,
  rightValue,
  rightLabel,
  gradientClass,
  borderClass,
  titleClass,
  iconClass,
  innerBgClass,
  dividerClass,
  valueClass,
  labelClass,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  leftValue: number;
  leftLabel: string;
  rightValue: number;
  rightLabel: string;
  gradientClass: string;
  borderClass: string;
  titleClass: string;
  iconClass: string;
  innerBgClass: string;
  dividerClass: string;
  valueClass: string;
  labelClass: string;
}) {
  return (
    <Card
      className={`flex h-full min-h-[140px] flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-sm ${gradientClass} ${borderClass}`}
    >
      <div className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${dividerClass}`}>
        <span className={`text-xs font-semibold tracking-tight lg:text-sm ${titleClass}`}>{title}</span>
        <Icon className={`h-4 w-4 shrink-0 lg:h-5 lg:w-5 ${iconClass}`} aria-hidden />
      </div>
      <div className={`grid min-h-0 flex-1 grid-cols-2 gap-0 ${innerBgClass}`}>
        <div
          className={`flex min-h-[88px] flex-col items-center justify-center px-2 py-4 text-center ${dividerClass} border-r`}
        >
          <span className={`text-3xl font-bold tabular-nums tracking-tight lg:text-[2rem] ${valueClass} leading-none`}>
            {leftValue}
          </span>
          <span className={`mt-2 max-w-[6.5rem] text-[11px] font-medium leading-snug lg:text-xs ${labelClass}`}>
            {leftLabel}
          </span>
        </div>
        <div className="flex min-h-[88px] flex-col items-center justify-center px-2 py-4 text-center">
          <span className={`text-3xl font-bold tabular-nums tracking-tight lg:text-[2rem] ${valueClass} leading-none`}>
            {rightValue}
          </span>
          <span className={`mt-2 max-w-[6.5rem] text-[11px] font-medium leading-snug lg:text-xs ${labelClass}`}>
            {rightLabel}
          </span>
        </div>
      </div>
    </Card>
  );
}

function SingleMetricCard({
  title,
  icon: Icon,
  value,
  subtitle,
  gradientClass,
  borderClass,
  titleClass,
  iconClass,
  valueClass,
  subtitleClass,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  subtitle: string;
  gradientClass: string;
  borderClass: string;
  titleClass: string;
  iconClass: string;
  valueClass: string;
  subtitleClass: string;
}) {
  return (
    <Card
      className={`flex h-full min-h-[140px] flex-col justify-between gap-0 rounded-xl border p-4 shadow-sm lg:p-5 ${gradientClass} ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-semibold tracking-tight lg:text-sm ${titleClass}`}>{title}</span>
        <Icon className={`h-4 w-4 shrink-0 lg:h-5 lg:w-5 ${iconClass}`} aria-hidden />
      </div>
      <div className="mt-2 flex flex-1 flex-col justify-center">
        <p className={`text-3xl font-bold tabular-nums tracking-tight lg:text-[2rem] ${valueClass} leading-none`}>
          {value}
        </p>
        <p className={`mt-2 text-xs ${subtitleClass}`}>{subtitle}</p>
      </div>
    </Card>
  );
}

export function ClientsMetricsCards({ statistics }: Props) {
  const s = statistics;

  return (
    <div className="grid grid-cols-2 items-stretch gap-3 lg:grid-cols-4 lg:gap-4">
      <SingleMetricCard
        title="Total de Clientes"
        icon={UsersIcon}
        value={s.total}
        subtitle="Cadastros ativos"
        gradientClass="bg-gradient-to-br from-blue-50 to-blue-100"
        borderClass="border-blue-200/80"
        titleClass="text-blue-900"
        iconClass="text-blue-600"
        valueClass="text-blue-900"
        subtitleClass="text-blue-700"
      />

      <SingleMetricCard
        title="Novos (7 dias)"
        icon={TrendingUp}
        value={s.novosUltimaSemana}
        subtitle="Última semana"
        gradientClass="bg-gradient-to-br from-green-50 to-green-100"
        borderClass="border-green-200/80"
        titleClass="text-green-900"
        iconClass="text-green-600"
        valueClass="text-green-900"
        subtitleClass="text-green-700"
      />

      <DualMetricCard
        title="EUA"
        icon={Building}
        leftValue={s.estadosUsa}
        leftLabel={s.estadosUsa === 1 ? 'estado' : 'estados'}
        rightValue={s.cidadesUsa}
        rightLabel={s.cidadesUsa === 1 ? 'cidade' : 'cidades'}
        gradientClass="bg-gradient-to-br from-purple-50 to-purple-100"
        borderClass="border-purple-200/80"
        titleClass="text-purple-950"
        iconClass="text-purple-600"
        innerBgClass="bg-white/35"
        dividerClass="border-purple-200/50"
        valueClass="text-purple-950"
        labelClass="text-purple-800"
      />

      <DualMetricCard
        title="Brasil"
        icon={Flag}
        leftValue={s.estadosBrasil}
        leftLabel={s.estadosBrasil === 1 ? 'estado' : 'estados'}
        rightValue={s.cidadesBrasil}
        rightLabel={s.cidadesBrasil === 1 ? 'cidade' : 'cidades'}
        gradientClass="bg-gradient-to-br from-orange-50 to-orange-100"
        borderClass="border-orange-200/80"
        titleClass="text-orange-950"
        iconClass="text-orange-600"
        innerBgClass="bg-white/35"
        dividerClass="border-orange-200/50"
        valueClass="text-orange-950"
        labelClass="text-orange-800"
      />
    </div>
  );
}
