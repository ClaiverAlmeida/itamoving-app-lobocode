import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { ReportDateInput } from "../ui/ReportDateInput";

export function ReportsFiltersPanel(props: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}) {
  const { dateFrom, dateTo, onDateFromChange, onDateToChange, onClear } = props;
  const hasRange = Boolean(dateFrom || dateTo);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal className="h-4 w-4" />
          Período
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          KPIs e gráficos usam as datas de cada registro no intervalo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:gap-6">
        <ReportDateInput
          id="reports-filter-from"
          label="Data inicial"
          value={dateFrom}
          onChange={onDateFromChange}
          className="w-full md:flex-1 md:min-w-[240px] md:max-w-xl"
        />
        <ReportDateInput
          id="reports-filter-to"
          label="Data final"
          value={dateTo}
          onChange={onDateToChange}
          className="w-full md:flex-1 md:min-w-[240px] md:max-w-xl"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={!hasRange}
          className="w-full shrink-0 md:mb-0.5 md:h-9 sm:w-auto"
        >
          Limpar período
        </Button>
      </CardContent>
    </Card>
  );
}
