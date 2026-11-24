import { api } from '@/app/core/http';

import type { AccountLimits, NotificationChannel } from '@/app/shared/types/api.types';
export type { AccountLimits, NotificationChannel } from '@/app/shared/types/api.types';

export const settingsService = {
  /** GET /accounts/me — limites atuais da conta */
  async getLimits(): Promise<AccountLimits> {
    const { data } = await api.get<AccountLimits>('/accounts/me');
    return { transactionLimit: data.transactionLimit, pixLimit: data.pixLimit };
  },

  /** PATCH /accounts/me — RF22: define limite diário de transações e limite de valor do PIX */
  async updateLimits(limits: AccountLimits): Promise<AccountLimits> {
    const { data } = await api.patch<AccountLimits>('/accounts/me', limits);
    return { transactionLimit: data.transactionLimit, pixLimit: data.pixLimit };
  },

  /** PATCH /api/users/me — RF25: canal preferencial de notificação (e-mail ou SMS) */
  async updateNotificationChannel(channel: NotificationChannel): Promise<void> {
    await api.patch('/api/users/me', { notificationType: channel });
  },
};
