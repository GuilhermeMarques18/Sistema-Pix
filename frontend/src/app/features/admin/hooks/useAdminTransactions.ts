import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import type { PixTransactionResponse } from '@/app/shared/types/api.types';

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState<PixTransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.listTransactions();
      const sorted = [...data].sort(
        (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
      );
      setTransactions(sorted);
    } catch {
      setError('Não foi possível carregar as transações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refetch: fetchTransactions };
}
