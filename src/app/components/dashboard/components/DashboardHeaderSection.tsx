import React from "react";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "../../ui/button";

export function DashboardHeaderSection({
  hasPermission,
  onNavigate,
  formatDate,
}: {
  hasPermission: (view: any, action: any) => boolean;
  onNavigate?: (view: any) => void;
  formatDate: (d: Date) => string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Bem-vindo ao ITAMOVING! 👋
        </h2>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">
          {formatDate(new Date())}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap">
        {hasPermission("relatorios", "read") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.("relatorios")}
            className="w-full sm:w-auto"
          >
            <FileText className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
        )}
        <Button size="sm" className="w-full sm:w-auto">
          <Sparkles className="w-4 h-4 mr-2" />
          Insights IA
        </Button>
      </div>
    </div>
  );
}

