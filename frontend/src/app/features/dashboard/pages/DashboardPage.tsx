'use client';

import { useDashboard } from '../hooks/useDashboard';
import { Button } from '@/app/shared/components/ui/button';
import {
  DashboardHeader,
  BalanceCard,
  QuickActions,
  TransactionList,
} from '../components';
import { ScheduledPixList } from '../components/ScheduledPixList';

export function DashboardPage() {
  const { account, transactions, transactionsUsed, isLoading, error, reload } = useDashboard();

  if (isLoading) {
    return <p className="px-4 pt-6 text-sm text-text-secondary">Carregando sua conta...</p>;
  }

  if (!account) {
    return (
      <div className="px-4 pt-6">
        <p role="alert" className="text-sm text-text-negative">{error || 'Conta não encontrada.'}</p>
        <Button className="mt-3" onClick={() => void reload()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <DashboardHeader userName={account.ownerName} />

      {error && <p role="alert" className="p-4 text-sm text-text-negative">{error} <button className="underline" onClick={() => void reload()}>Tentar novamente</button></p>}
      {account.status === 'BLOQUEADA' && <p className="p-4 text-sm text-text-negative">Sua conta está bloqueada para enviar Pix.</p>}
      {account.blockedBalance > 0 && <p className="px-4 text-sm text-text-secondary">Saldo retido: {account.blockedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Disponível: {account.availableBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.</p>}

      {/* Saldo */}
      <BalanceCard
        balance={account.balance}
        transactionsUsed={transactionsUsed}
        transactionLimit={account.transactionLimit}
        pixLimit={account.pixLimit}
      />

      {/* Divisor sutil */}
      <div className="mx-4 my-3 h-px bg-bg-input" />

      {/* Ações rápidas */}
      <QuickActions
        blocked={account.status === 'BLOQUEADA'}
        onRefresh={reload}
      />

      <ScheduledPixList />

      {/* Divisor sutil */}
      <div className="mx-4 my-3 h-px bg-bg-input" />

      {/* Transações */}
      <TransactionList transactions={transactions} />
    </>
  );
}
