import { useState, useEffect, useCallback } from 'react';
import { adminService, type AdminAccount } from '../services/admin.service';

export function useAdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.listAccounts();
      setAccounts(data);
    } catch {
      setError('Não foi possível carregar as contas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  async function approveAccount(accountId: string) {
    try {
      setActionLoadingId(accountId);
      const updated = await adminService.approveAccount(accountId);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? updated : acc))
      );
    } catch {
      setError('Erro ao aprovar conta. Tente novamente.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function blockAccount(accountId: string) {
    try {
      setActionLoadingId(accountId);
      const updated = await adminService.blockAccount(accountId);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? updated : acc))
      );
    } catch {
      setError('Erro ao bloquear conta. Tente novamente.');
    } finally {
      setActionLoadingId(null);
    }
  }

  const pending = accounts.filter((a) => a.status === 'BLOQUEADA');
  const active = accounts.filter((a) => a.status === 'DESBLOQUEADA');

  return {
    accounts,
    pending,
    active,
    isLoading,
    error,
    actionLoadingId,
    approveAccount,
    blockAccount,
    refetch: fetchAccounts,
  };
}
