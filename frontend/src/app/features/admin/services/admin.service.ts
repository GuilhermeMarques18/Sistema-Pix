import { api } from '@/app/core/http';
import type { PixTransactionResponse } from '@/app/shared/types/api.types';

export interface AdminAccount {
  id: string;
  userId: string;
  ownerName: string;
  balance: number;
  status: 'BLOQUEADA' | 'DESBLOQUEADA';
  type: string;
  transactionLimit: number;
  pixLimit: number;
  createdAccount: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  telefone: string;
  tipoPessoa: string;
  documento: string;
  role: 'USER' | 'ADMIN' | 'OWNER';
  createdUser: string;
}

export type { PixTransactionResponse };

export const adminService = {
  async listAccounts(): Promise<AdminAccount[]> {
    const { data } = await api.get<AdminAccount[]>('/accounts');
    return data;
  },

  async approveAccount(accountId: string): Promise<AdminAccount> {
    const { data } = await api.patch<AdminAccount>(`/accounts/${accountId}/unblock`);
    return data;
  },

  async blockAccount(accountId: string): Promise<AdminAccount> {
    const { data } = await api.patch<AdminAccount>(`/accounts/${accountId}/block`);
    return data;
  },

  async listUsers(): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>('/api/users');
    return data;
  },

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<AdminUser> {
    const { data } = await api.patch<AdminUser>(`/api/admin/users/${userId}/role`, { role });
    return data;
  },

  async listTransactions(): Promise<PixTransactionResponse[]> {
    const { data } = await api.get<PixTransactionResponse[]>('/api/pix/transactions');
    return data;
  },
};
