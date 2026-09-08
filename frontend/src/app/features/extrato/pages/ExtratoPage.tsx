'use client';

import { useExtrato } from '../hooks/useExtrato';
import {
  ExtratoBalanceHeader,
  ExtratoPeriodFilter,
  ExtratoTransactionList,
} from '../components';

export function ExtratoPage() {
  const { filteredTransactions, account, isLoading, error, period, setPeriod } = useExtrato();

  return (
    <>
      {/* Saldo + botão Pix */}
      <ExtratoBalanceHeader balance={account?.balance ?? 0} />

      {/* Divisor */}
      <div className="mx-4 my-3 h-px bg-bg-input" />

      {/* Filtro de período */}
      <ExtratoPeriodFilter period={period} onChange={setPeriod} />

      {/* Erro global */}
      {error && (
        <p className="mx-4 mb-4 text-xs text-text-negative">{error}</p>
      )}

      {/* Lista de transações */}
      <ExtratoTransactionList
        transactions={filteredTransactions}
        account={account ?? { id: '', userId: '', ownerName: '', balance: 0, status: '', type: '', transactionLimit: 0, pixLimit: 0, createdAccount: '' }}
        isLoading={isLoading}
      />
    </>
  );
}
