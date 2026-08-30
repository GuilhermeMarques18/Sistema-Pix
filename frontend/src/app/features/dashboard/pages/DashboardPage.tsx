'use client';

import { type Transaction } from '../components/TransactionItem';
import {
  DashboardHeader,
  BalanceCard,
  QuickActions,
  TransactionList,
} from '../components';

/** Mock data — substituir por chamada à API quando o backend estiver pronto */
const MOCK_USER = 'Geovana Veras';

const MOCK_BALANCE = {
  balance: 400.0,
  used: 4600.0,
  limit: 5000.0,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'Vitor Carvalho Santos',
    document: '999.999.999-08',
    amount: 700.0,
    type: 'credit',
    date: 'Hoje',
    time: '17:03',
  },
  {
    id: '2',
    name: 'Renan Almeida Barros',
    document: '888.999.999-08',
    amount: 200.0,
    type: 'debit',
    date: 'Hoje',
    time: '17:03',
  },
  {
    id: '3',
    name: 'Renan Almeida Barros',
    document: '888.999.999-08',
    amount: 200.0,
    type: 'credit',
    date: 'Hoje',
    time: '17:03',
  },
  {
    id: '4',
    name: 'Renan Almeida Barros',
    document: '888.999.999-08',
    amount: 200.0,
    type: 'debit',
    date: 'Hoje',
    time: '17:03',
  },
  {
    id: '5',
    name: 'Vitor Carvalho Santos',
    document: '888.999.999-08',
    amount: 200.0,
    type: 'debit',
    date: 'Hoje',
    time: '17:03',
  },
];

export function DashboardPage() {
  return (
    <>
      {/* Header */}
      <DashboardHeader userName={MOCK_USER} />

      {/* Saldo */}
      <BalanceCard
        balance={MOCK_BALANCE.balance}
        used={MOCK_BALANCE.used}
        limit={MOCK_BALANCE.limit}
      />

      {/* Divisor sutil */}
      <div className="mx-4 my-3 h-px bg-bg-input" />

      {/* Ações rápidas */}
      <QuickActions />

      {/* Divisor sutil */}
      <div className="mx-4 my-3 h-px bg-bg-input" />

      {/* Transações */}
      <TransactionList transactions={MOCK_TRANSACTIONS} />
    </>
  );
}
