'use client';

import { ArrowLineDown, ArrowLineUp } from '@phosphor-icons/react';

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  name: string;
  document: string;
  amount: number;
  type: TransactionType;
  date: string;
  time: string;
}

interface TransactionItemProps {
  transaction: Transaction;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.type === 'credit';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-input px-4 py-3">
      {/* Icon */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full
          ${isCredit ? 'text-brand-element' : 'text-text-negative'}`}
      >
        {isCredit ? (
          <ArrowLineDown size={20} weight="bold" />
        ) : (
          <ArrowLineUp size={20} weight="bold" />
        )}
      </div>

      {/* Name + document */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{transaction.name}</p>
        <p className="text-xs text-text-secondary">{transaction.document}</p>
      </div>

      {/* Amount + date */}
      <div className="text-right flex-shrink-0">
        <p
          className={`text-sm font-semibold ${
            isCredit ? 'text-brand-element' : 'text-text-negative'
          }`}
        >
          {isCredit ? '+ ' : '- '}
          {formatBRL(transaction.amount)}
        </p>
        <p className="text-xs text-text-secondary">
          Hoje, {transaction.time}
        </p>
      </div>
    </div>
  );
}
