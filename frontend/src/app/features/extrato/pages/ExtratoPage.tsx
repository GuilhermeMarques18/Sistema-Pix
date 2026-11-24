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
  const { filteredTransactions, account, isLoading, error, period, setPeriod, reload } = useExtrato();
  const [sendPixOpen, setSendPixOpen] = useState(false);

  return (
    <>
      {/* Saldo + botão Pix */}
      {account && !isLoading && !error && (
        <ExtratoBalanceHeader
          balance={account.balance}
          onPixClick={() => setSendPixOpen(true)}
        />
      )}

      {/* Divisor */}
      <div className="mx-4 my-3 h-px bg-bg-input" />

      {/* Filtro de período */}
      <ExtratoPeriodFilter period={period} onChange={setPeriod} />

      {/* Erro global */}
      {error && (
        <p className="mx-4 mb-4 text-xs text-text-negative">{error}</p>
      )}

      {/* Lista de transações */}
      {isLoading && <p role="status" className="p-4 text-text-secondary">Carregando extrato...</p>}
      {account && !error && (
        <ExtratoTransactionList transactions={filteredTransactions} account={account} isLoading={isLoading} />
      )}

      {/* Fluxo de envio de Pix — overlay full-screen (fixed, z-50) */}
      {sendPixOpen && account && (
        <SendPixFlow
          onCompleted={reload}
          onClose={() => { setSendPixOpen(false); void reload(); }}
        />
      )}
    </>
  );
}
