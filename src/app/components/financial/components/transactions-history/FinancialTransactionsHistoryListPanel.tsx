import React, { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { DollarSign } from "lucide-react";
import type { FinancialTransaction } from "../../../../api";
import { FinancialTransactionHistoryRow } from "./FinancialTransactionHistoryRow";
import { FinancialTransactionsHistoryPagination } from "./FinancialTransactionsHistoryPagination";
import { FINANCIAL_HISTORY_PAGE_SIZE } from "./financialTransactionsHistory.constants";

export function FinancialTransactionsHistoryListPanel(props: {
  items: FinancialTransaction[];
  page: number;
  onPageChange: (page: number) => void;
  variant: "REVENUE" | "EXPENSE";
  onDelete: (id: string) => void;
  emptyTitle: string;
  emptyHint?: string;
}) {
  const { items, page, onPageChange, variant, onDelete, emptyTitle, emptyHint } = props;
  const pageSize = FINANCIAL_HISTORY_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  useEffect(() => {
    if (page !== safePage) onPageChange(safePage);
  }, [page, safePage, onPageChange]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
        <DollarSign className="mx-auto mb-3 size-12 text-muted-foreground/40" />
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        {emptyHint ? <p className="mt-1 text-xs text-muted-foreground">{emptyHint}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {pageItems.map((t) => (
            <FinancialTransactionHistoryRow key={t.id ?? `${t.date}-${t.description}`} transacao={t} variant={variant} onDelete={onDelete} />
          ))}
        </AnimatePresence>
      </div>
      <FinancialTransactionsHistoryPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
