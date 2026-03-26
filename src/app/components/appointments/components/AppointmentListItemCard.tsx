import React from 'react';
import { isPast, isToday } from 'date-fns';
import { motion } from 'motion/react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Box, Calendar as CalendarIcon, MapPin, MessageCircle, Navigation, User } from 'lucide-react';
import type { Agendamento } from '../../../api';
import { formatDateOnlyToBR } from '../../../utils';
import { cn } from '../../ui/utils';

type StatusConfig = {
  label: string;
  color: string;
  textColor: string;
  bgLight: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Props = {
  agendamento: Agendamento;
  onOpenDetails: (agendamento: Agendamento) => void;
  getStatusConfig: (status: string) => StatusConfig;
  getStatusKey: (status: string) => string;
};

export function AppointmentListItemCard({
  agendamento,
  onOpenDetails,
  getStatusConfig,
  getStatusKey,
}: Props) {
  const config = getStatusConfig(agendamento.status);
  const StatusIcon = config.icon;
  const dateStr = (agendamento.collectionDate ?? '').slice(0, 10);
  const agDate =
    dateStr.length >= 10
      ? new Date(dateStr + 'T12:00:00.000Z')
      : new Date(NaN);
  const isAtrasado =
    !Number.isNaN(agDate.getTime()) &&
    isPast(agDate) &&
    getStatusKey(agendamento.status) === 'PENDING' &&
    !isToday(agDate);

  return (
    <motion.div
      key={agendamento.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card
        className={`border-l-4 hover:shadow-xl transition-all cursor-pointer ${isAtrasado
          ? 'bg-red-50 border-red-500'
          : config.bgLight
          }`}
        style={{
          borderLeftColor: isAtrasado
            ? '#EF4444'
            : config.color
              .replace('bg-', '#')
              .replace('500', '600'),
        }}
        onClick={() => onOpenDetails(agendamento)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
              <div
                className={`p-2 rounded-full ${config.color} bg-opacity-20 flex-shrink-0`}
              >
                <StatusIcon
                  className={`w-5 h-5 ${config.textColor}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-sm sm:text-base">
                    {dateStr ?
                      (formatDateOnlyToBR(dateStr) || '--/--/----')
                      : '--/--/----'}
                  </span>
                  <span className="text-muted-foreground">
                    •
                  </span>
                  <span className="font-semibold text-sm sm:text-base">
                    {agendamento.collectionTime
                      ? agendamento.collectionTime
                      : '--:--'}
                  </span>
                  <Badge className={config.bgLight}>
                    <span className={config.textColor}>
                      {config.label}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "inline-flex w-fit items-center gap-1 whitespace-nowrap border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
                      agendamento.isPeriodic
                        ? "border-indigo-200/90 bg-indigo-50 text-indigo-900 dark:border-indigo-800/50 dark:bg-indigo-950/45 dark:text-indigo-100"
                        : "border-slate-300/80 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200",
                    )}
                  >
                    {agendamento.isPeriodic ? (
                      <CalendarIcon className="h-3 w-3 text-indigo-700 dark:text-indigo-300" />
                    ) : (
                      <Box className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                    )}
                    {agendamento.isPeriodic ? "Periódico" : "Único"}
                  </Badge>
                  {isAtrasado && (
                    <Badge className="bg-red-100">
                      <span className="text-red-700">
                        Atrasado
                      </span>
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold mb-1 break-words">
                  {agendamento.client.name}
                </h4>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-3 sm:line-clamp-2 break-words leading-relaxed">
                    {agendamento.client.usaAddress}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 min-w-0">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span className="break-words">
                      {agendamento.user.name}
                    </span>
                  </div>
                  {agendamento.observations && (
                    <span className="text-xs italic line-clamp-1 break-words flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {':'} {agendamento.observations}
                    </span>
                  )}
                  <span className="text-xs font-bold text-foreground line-clamp-1 break-words flex items-center gap-1">
                    <Box className="w-3 h-3 text-foreground" />
                    {':'} {agendamento.qtyBoxes} {' '}
                    {'Caixa(s)'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agendamento.client.usaAddress)}`,
                    '_blank',
                  );
                }}
                className="flex-1 sm:flex-none"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
