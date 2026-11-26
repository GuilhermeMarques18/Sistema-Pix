import { api } from '@/app/core/http';
import type { ScheduledPix, UpdateScheduledPixPayload } from '../types/scheduledPix.types';

export const scheduledPixService = {
  async findPending(): Promise<ScheduledPix[]> {
    const { data } = await api.get<ScheduledPix[]>('/api/pix/scheduled-transactions');
    return data;
  },

  async update(id: string, payload: UpdateScheduledPixPayload): Promise<ScheduledPix> {
    const { data } = await api.put<ScheduledPix>(`/api/pix/scheduled-transactions/${id}`, payload);
    return data;
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/api/pix/scheduled-transactions/${id}`);
  },
};
