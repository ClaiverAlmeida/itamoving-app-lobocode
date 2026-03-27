import React from "react";
import { Badge } from "../../ui/badge";
import { Bot, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useDrag } from "react-dnd";
import type { Lead } from "../services.types";
import { PRIORIDADE_CONFIG, STATUS_CONFIG } from "../services.constants";
import { formatCurrency, getTempoDecorrido } from "../services.utils";

const BORDER_LEFT_CLASS_BY_STATUS_COLOR: Record<string, string> = {
  "bg-blue-500": "border-l-blue-600",
  "bg-purple-500": "border-l-purple-600",
  "bg-yellow-500": "border-l-yellow-600",
  "bg-orange-500": "border-l-orange-600",
  "bg-green-500": "border-l-green-600",
  "bg-red-500": "border-l-red-600",
};

export function ServicesKanbanCard({
  lead,
  onSelect,
}: {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "LEAD",
    item: { id: lead.id, status: lead.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const config = STATUS_CONFIG[lead.status];
  const prioridadeInfo = lead.prioridade ? PRIORIDADE_CONFIG[lead.prioridade] : null;
  const PrioridadeIcon = prioridadeInfo?.icon;
  const borderLeftClass = BORDER_LEFT_CLASS_BY_STATUS_COLOR[config.color] ?? "border-l-slate-400";

  return (
    <motion.div
      ref={(node) => {
        drag(node);
      }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`p-4 cursor-move hover:shadow-xl transition-all border-l-4 group relative rounded-lg bg-white ${borderLeftClass}`}
        onClick={() => onSelect(lead)}
      >
        {prioridadeInfo && (
          <div
            className={`absolute -top-2 -right-2 ${prioridadeInfo.bg} rounded-full p-1.5 border-2 border-white shadow-md`}
          >
            {PrioridadeIcon ? <PrioridadeIcon className={`w-3 h-3 ${prioridadeInfo.color}`} /> : null}
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{lead.nome}</h4>
            <div className="flex items-center gap-1 flex-wrap">
              {lead.atendidoPorBot && (
                <Badge variant="outline" className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  Bot
                </Badge>
              )}
              {lead.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="break-words">
            {lead.origem} → {lead.destino}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 italic">"{lead.ultimaMensagem}"</p>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {lead.valorEstimado ? <span className="font-semibold text-green-600">{formatCurrency(lead.valorEstimado)}</span> : null}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{getTempoDecorrido(lead.dataUltimaMensagem)}</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
      </div>
    </motion.div>
  );
}

