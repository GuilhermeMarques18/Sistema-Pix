import { api } from '@/app/core/http';
import type { PixTransactionResponse, AccountSummary } from '../types/extrato.types';

export const extratoService = {
  async getMyTransactions(): Promise<PixTransactionResponse[]> {
    const { data } = await api.get<PixTransactionResponse[]>('/api/pix/transactions/me');
    return data;
  },

  async getMyAccount(): Promise<AccountSummary> {
    const { data } = await api.get<AccountSummary>('/accounts/me');
    return data;
  },
};
