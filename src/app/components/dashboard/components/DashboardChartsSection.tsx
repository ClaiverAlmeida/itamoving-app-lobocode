import React from "react";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import type { FinanceiroDataPoint, ContainerStatusDataPoint, EstoqueDataPoint, PerformanceDataPoint } from "../dashboard.utils";
import { FinancePerformanceChart } from "./charts/FinancePerformanceChart";
import { ContainersStatusPieChart } from "./charts/ContainersStatusPieChart";
import { InventoryBarChart } from "./charts/InventoryBarChart";
import { WeeklyPerformanceBarChart } from "./charts/WeeklyPerformanceBarChart";
import type { AtividadeRecente } from "../dashboard.constants";
import { DashboardActivitiesRecentCard } from "./DashboardActivitiesRecentCard";

export function DashboardChartsSection({
  hasPermissionFinanceiroRead,
  financeiroData,
  containersStatusData,
  containersAtivos,
  containersCount,
  estoqueData,
  performanceData,
  atividadesRecentes,
}: {
  hasPermissionFinanceiroRead: boolean;
  financeiroData: FinanceiroDataPoint[];
  containersStatusData: ContainerStatusDataPoint[];
  containersAtivos: number;
  containersCount: number;
  estoqueData: EstoqueDataPoint[];
  performanceData: PerformanceDataPoint[];
  atividadesRecentes: AtividadeRecente[];
}) {
  return (
    <>
      <div className={`grid gap-6 ${hasPermissionFinanceiroRead ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
        {hasPermissionFinanceiroRead && <FinancePerformanceChart financeiroData={financeiroData} />}
        <ContainersStatusPieChart containersStatusData={containersStatusData} containersAtivos={containersAtivos} containersCount={containersCount} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <InventoryBarChart estoqueData={estoqueData} />
        <WeeklyPerformanceBarChart performanceData={performanceData} />
        <DashboardActivitiesRecentCard atividadesRecentes={atividadesRecentes} />
      </div>
    </>
  );
}

