'use client';

import { ExtratoTransactionItem } from './ExtratoTransactionItem';
import type { PixTransactionResponse, AccountSummary } from '../types/extrato.types';

interface ExtratoTransactionListProps {
  transactions: PixTransactionResponse[];
  account: AccountSummary;
  isLoading: boolean;
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-input px-4 py-3 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-border flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-border" />
        <div className="h-2.5 w-1/3 rounded bg-border" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-3 w-20 rounded bg-border ml-auto" />
        <div className="h-2.5 w-14 rounded bg-border ml-auto" />
      </div>
    </div>
  );
}

export function ExtratoTransactionList({
  transactions,
  account,
  isLoading,
}: ExtratoTransactionListProps) {
  if (isLoading) {
    return (
      <div className="px-4 flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-text-secondary">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="px-4 flex flex-col gap-2">
      {transactions.map((transaction) => (
        <ExtratoTransactionItem
          key={transaction.idTransacao}
          transaction={transaction}
          account={account}
        />
      ))}
    </div>
  );
}
