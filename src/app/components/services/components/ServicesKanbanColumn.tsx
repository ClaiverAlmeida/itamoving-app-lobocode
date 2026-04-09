import React from "react";
import { Badge } from "../../ui/badge";
import { DollarSign } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useDrop } from "react-dnd";
import type { ReactNode } from "react";
import type { LeadStatus } from "../services.types";
import { STATUS_CONFIG } from "../services.constants";
import { formatCurrency } from "../services.utils";

export function ServicesKanbanColumn({
  status,
  children,
  onDrop,
  count,
  totalValue,
}: {
  status: LeadStatus;
  children: ReactNode;
  onDrop: (leadId: string, newStatus: LeadStatus) => void;
  count: number;
  totalValue: number;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "LEAD",
    drop: (item: { id: string; status: LeadStatus }) => {
      if (item.status !== status) onDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const config = STATUS_CONFIG[status];

  return (
    <div
      ref={(node) => {
        drop(node);
      }}
      className={`flex-shrink-0 w-80 transition-all duration-200 ${isOver ? "scale-105" : ""}`}
    >
      <div
        className={`mb-4 p-4 rounded-lg ${isOver ? "bg-blue-50 ring-2 ring-blue-300" : "bg-white"} transition-all`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <h3 className="font-semibold text-foreground">{config.label}</h3>
          <Badge variant="secondary" className="ml-auto">
            {count}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(totalValue)}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 min-h-[500px] bg-slate-50 rounded-lg p-3">
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>
  );
}

