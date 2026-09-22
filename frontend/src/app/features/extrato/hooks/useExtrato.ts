'use client';

import { useState, useEffect, useCallback } from 'react';
import { extratoService } from '../services/extrato.service';
import type { PixTransactionResponse, AccountSummary, PeriodFilter } from '../types/extrato.types';

interface UseExtratoReturn {
  transactions: PixTransactionResponse[];
  filteredTransactions: PixTransactionResponse[];
  account: AccountSummary | null;
  isLoading: boolean;
  error: string | null;
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
}

function filterByPeriod(
  transactions: PixTransactionResponse[],
  period: PeriodFilter,
): PixTransactionResponse[] {
  if (period === 'all') return transactions;

  const days = parseInt(period, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return transactions.filter((t) => new Date(t.dataHora) >= cutoff);
}

export function useExtrato(): UseExtratoReturn {
  const [transactions, setTransactions] = useState<PixTransactionResponse[]>([]);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('30');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [txList, accountData] = await Promise.all([
        extratoService.getMyTransactions(),
        extratoService.getMyAccount(),
      ]);

      // Ordena da mais recente para a mais antiga
      const sorted = [...txList].sort(
        (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
      );

      setTransactions(sorted);
      setAccount(accountData);
    } catch {
      setError('Não foi possível carregar o extrato. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTransactions = filterByPeriod(transactions, period);

  return {
    transactions,
    filteredTransactions,
    account,
    isLoading,
    error,
    period,
    setPeriod,
  };
}
