import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Calendar, CreditCard, DollarSign, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { FinancialTransaction } from "../../../api";
import { formatCurrencyUSD } from "../index";

export function FinancialTransactionsHistory(props: {
  filteredTransacoes: FinancialTransaction[];
  onDelete: (id: string) => void;
}) {
  const { filteredTransacoes, onDelete } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
        <CardDescription>{filteredTransacoes.length} transação(ões) encontrada(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTransacoes
              .slice()
              .reverse()
              .map((transacao) => {
                const data = new Date(transacao.date);
                const isDataValid = !isNaN(data.getTime());

                return (
                  <motion.div
                    key={transacao.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
                        transacao.type === "REVENUE" ? "border-green-500 bg-green-50/50" : "border-red-500 bg-red-50/50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={transacao.type === "REVENUE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {transacao.type === "REVENUE" ? "Receita" : "Despesa"}
                              </Badge>
                              <span className="font-semibold break-words">{transacao.category}</span>
                              <Badge variant="outline" className="text-xs">
                                {transacao.paymentMethod}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1 break-words">{transacao.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {isDataValid ? format(data, "dd/MM/yyyy", { locale: ptBR }) : transacao.date}
                              </span>
                              {transacao.clientName !== "N/A" && (
                                <span className="flex items-center gap-1 break-words">
                                  <CreditCard className="w-3 h-3" />
                                  {transacao.clientName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                            <div
                              className={`text-base sm:text-xl font-bold ${
                                transacao.type === "REVENUE" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transacao.type === "REVENUE" ? "+" : "-"}
                              {formatCurrencyUSD(transacao.value)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(transacao.id!);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {filteredTransacoes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

