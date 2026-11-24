import { useCallback, useEffect, useState } from 'react';
import { extratoService } from '@/app/features/extrato/services/extrato.service';
import type { AccountSummary, PixExtractItemResponse } from '@/app/features/extrato/types/extrato.types';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import type { Transaction } from '../components/TransactionItem';

export function useDashboard() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [history, setHistory] = useState<PixExtractItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [accountData, transactions] = await Promise.all([
        extratoService.getMyAccount(),
        extratoService.getMyTransactions('7'),
      ]);
      setAccount(accountData);
      setHistory(transactions);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar sua conta.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const transactionsUsed = history.filter((t) =>
    t.tipo === 'SAIDA' && t.dataHora.slice(0, 10) === today,
  ).length;

  const transactions: Transaction[] = [...history]
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
    .slice(0, 5)
    .map((transaction) => {
      const isCredit = transaction.tipo === 'ENTRADA';
      const timestamp = new Date(transaction.dataHora);
      return {
        id: transaction.idTransacao,
        name: transaction.descricao || (isCredit ? 'Pix recebido' : 'Pix enviado'),
        document: '',
        amount: transaction.valor,
        type: isCredit ? 'credit' : 'debit',
        date: transaction.dataHora.slice(0, 10) === today ? 'Hoje' : timestamp.toLocaleDateString('pt-BR'),
        time: timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
    });

  return { account, transactions, transactionsUsed, isLoading, error, reload };
}
