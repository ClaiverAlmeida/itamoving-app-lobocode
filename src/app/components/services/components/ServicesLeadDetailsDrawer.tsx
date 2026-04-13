import React from "react";
import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Calendar, CheckCircle2, DollarSign, Mail, MapPin, MessageCircle, Phone, Sparkles, StickyNote, Tag, User as UserIcon, Bot, X, XCircle } from "lucide-react";
import type { Lead } from "../services.types";
import { PRIORIDADE_CONFIG, STATUS_CONFIG } from "../services.constants";
import { formatCurrency, getAISuggestion } from "../services.utils";
import { getAppTimeZone } from "../../../utils";

export function ServicesLeadDetailsDrawer({
  selectedLead,
  onClose,
  novaNota,
  onNovaNotaChange,
  onAddNota,
}: {
  selectedLead: Lead;
  onClose: () => void;
  novaNota: string;
  onNovaNotaChange: (v: string) => void;
  onAddNota: () => void;
}) {
  const inputId = useId();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white shadow-2xl border-l border-border z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-border p-4 sm:p-6 z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground break-words">{selectedLead.nome}</h2>
                {selectedLead.prioridade && (
                  <Badge className={PRIORIDADE_CONFIG[selectedLead.prioridade].bg}>
                    <span className={PRIORIDADE_CONFIG[selectedLead.prioridade].color}>{PRIORIDADE_CONFIG[selectedLead.prioridade].label}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={STATUS_CONFIG[selectedLead.status].color}>{STATUS_CONFIG[selectedLead.status].label}</Badge>
                {selectedLead.atendidoPorBot && (
                  <Badge variant="outline">
                    <Bot className="w-3 h-3 mr-1" />
                    Atendimento Bot
                  </Badge>
                )}
                {selectedLead.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-1">Sugestão IA</p>
                <p className="text-sm text-purple-700">{getAISuggestion(selectedLead)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{selectedLead.telefone}</span>
            </div>
            {selectedLead.email ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="break-all">{selectedLead.email}</span>
              </div>
            ) : null}
            <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">
                {selectedLead.origem} → {selectedLead.destino}
              </span>
            </div>
            {selectedLead.dataMudanca ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Previsto:{" "}
                  {new Date(selectedLead.dataMudanca).toLocaleDateString("pt-BR", {
                    timeZone: getAppTimeZone(),
                  })}
                </span>
              </div>
            ) : null}
            {selectedLead.valorEstimado ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(selectedLead.valorEstimado)}</span>
              </div>
            ) : null}
          </div>
        </div>

        {selectedLead.notas ? (
          <div className="px-4 sm:px-6 py-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-start gap-2">
              <StickyNote className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1 text-sm">Notas</h3>
                <p className="text-sm text-yellow-800 whitespace-pre-line">{selectedLead.notas}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="px-4 sm:px-6 py-4 border-b border-border bg-slate-50">
          <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Adicionar Nota
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Textarea
              id={inputId}
              placeholder="Digite uma nota sobre este lead..."
              value={novaNota}
              onChange={(e) => onNovaNotaChange(e.target.value)}
              className="flex-1 text-sm"
              rows={2}
            />
            <Button onClick={onAddNota} size="sm" disabled={!novaNota.trim()}>
              Salvar
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Histórico de Conversas
          </h3>
          <div className="space-y-4">
            {selectedLead.conversas.map((conversa) => (
              <motion.div
                key={conversa.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${conversa.remetente === "cliente" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    conversa.remetente === "cliente"
                      ? "bg-[#DCF8C6] text-slate-900"
                      : conversa.remetente === "bot"
                        ? "bg-blue-50 text-slate-900 border border-blue-200"
                        : "bg-white text-slate-900 border border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {conversa.remetente === "bot" ? <Bot className="w-3 h-3 text-blue-600" /> : null}
                    {conversa.remetente === "atendente" ? <UserIcon className="w-3 h-3 text-accent" /> : null}
                    <span className="text-xs font-medium">
                      {conversa.remetente === "cliente" ? selectedLead.nome : conversa.remetente === "bot" ? "Bot ITAMOVING" : "Atendente"}
                    </span>
                  </div>
                  <p className="text-sm">{conversa.texto}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {conversa.data.toLocaleString("pt-BR", {
                      timeZone: getAppTimeZone(),
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <Button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Continuar no WhatsApp
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

