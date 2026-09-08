'use client';

import { useState } from 'react';
import { useExtrato } from '../hooks/useExtrato';
import {
  ExtratoBalanceHeader,
  ExtratoPeriodFilter,
  ExtratoTransactionList,
} from '../components';
import { SendPixFlow } from '../pix-send';

export function ExtratoPage() {
  const { filteredTransactions, account, isLoading, error, period, setPeriod } = useExtrato();
  const [sendPixOpen, setSendPixOpen] = useState(false);

  return (
    <>
      {/* Saldo + botão Pix */}
      <ExtratoBalanceHeader
        balance={account?.balance ?? 0}
        onPixClick={() => setSendPixOpen(true)}
      />

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
        account={account ?? {
          id: '',
          userId: '',
          ownerName: '',
          balance: 0,
          status: '',
          type: '',
          transactionLimit: 0,
          pixLimit: 0,
          createdAccount: '',
        }}
        isLoading={isLoading}
      />

      {/* Fluxo de envio de Pix — overlay full-screen (fixed, z-50) */}
      {sendPixOpen && (
        <SendPixFlow
          availableBalance={account?.balance ?? 0}
          pixLimit={account?.pixLimit ?? 0}
          onClose={() => setSendPixOpen(false)}
        />
      )}
    </>
  );
}
