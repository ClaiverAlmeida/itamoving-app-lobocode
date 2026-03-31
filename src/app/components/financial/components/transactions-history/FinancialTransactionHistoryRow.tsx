import React from "react";
import { motion } from "motion/react";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Calendar, CreditCard, Trash2 } from "lucide-react";
import type { FinancialTransaction } from "../../../../api";
import { formatCurrencyUSD } from "../../index";
import { formatDateOnlyToBR } from "../../../../utils/date";

export type FinancialTransactionHistoryRowProps = {
  transacao: FinancialTransaction;
  variant: "REVENUE" | "EXPENSE";
  onDelete: (id: string) => void;
};

export const FinancialTransactionHistoryRow = React.forwardRef<
  HTMLDivElement,
  FinancialTransactionHistoryRowProps
>(function FinancialTransactionHistoryRow({ transacao, variant, onDelete }, ref) {
  const dataLabel = formatDateOnlyToBR(transacao.date);
  const isRevenue = variant === "REVENUE";

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={`overflow-hidden border transition-shadow hover:shadow-md ${
          isRevenue
            ? "border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/80 to-background dark:from-emerald-950/20"
            : "border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/80 to-background dark:from-rose-950/20"
        }`}
      >
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    isRevenue
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-rose-600 text-white hover:bg-rose-600"
                  }
                >
                  {isRevenue ? "Receita" : "Despesa"}
                </Badge>
                <span className="font-semibold text-foreground break-words">{transacao.category}</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {transacao.paymentMethod}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground break-words leading-snug">{transacao.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 shrink-0 opacity-70" />
                  {dataLabel || transacao.date}
                </span>
                {transacao.clientName ? (
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <CreditCard className="size-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{transacao.clientName}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
              <span
                className={`text-lg font-bold tabular-nums sm:text-xl ${
                  isRevenue ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {isRevenue ? "+" : "−"}
                {formatCurrencyUSD(transacao.value)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => transacao.id && onDelete(transacao.id)}
                aria-label="Excluir transação"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

FinancialTransactionHistoryRow.displayName = "FinancialTransactionHistoryRow";
