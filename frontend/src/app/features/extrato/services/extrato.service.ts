import { api } from '@/app/core/http';
import type { PixExtractItemResponse, AccountSummary, PeriodFilter } from '../types/extrato.types';

export const extratoService = {
  async getMyTransactions(period?: PeriodFilter): Promise<PixExtractItemResponse[]> {
    const params: Record<string, string | number> = {};

    if (period && period !== 'all') {
      params.ultimosDias = parseInt(period, 10);
    }

    const { data } = await api.get<{ transacoes: PixExtractItemResponse[] }>(
      '/api/pix/transactions/history',
      { params }
    );
    return data.transacoes;
  },

  async getMyAccount(): Promise<AccountSummary> {
    const { data } = await api.get<AccountSummary>('/accounts/me');
    return data;
  },
};
