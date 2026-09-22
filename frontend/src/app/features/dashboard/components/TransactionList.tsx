'use client';

import { TransactionItem, type Transaction } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="px-4 pt-5">
        <h2 className="text-base font-semibold text-text mb-3">Últimas transações</h2>
        <p className="text-sm text-text-secondary text-center py-8">
          Nenhuma transação encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-4">
      <h2 className="text-base font-semibold text-text mb-3">Últimas transações</h2>
      <div className="flex flex-col gap-2">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
