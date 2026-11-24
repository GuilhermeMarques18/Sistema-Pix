import { api } from '@/app/core/http';

import type { AccountSummary, UpdateUserPayload, UserProfile } from '@/app/shared/types/api.types';

export type { UpdateUserPayload, UserProfile } from '@/app/shared/types/api.types';
export type CurrentAccount = AccountSummary;

export const userService = {
  /** GET /accounts/me */
  async getMyAccount(): Promise<AccountSummary> {
    const { data } = await api.get<AccountSummary>('/accounts/me');
    return data;
  },

  /** GET /api/users/me */
  async getMe(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/api/users/me');
    return data;
  },

  /** PATCH /api/users/me — atualiza só os campos enviados */
  async updateMe(payload: UpdateUserPayload): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>('/api/users/me', payload);
    return data;
  },

  /** DELETE /api/users/{id} — desativa o usuário (soft delete no backend) */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/api/users/${userId}`);
  },
};
