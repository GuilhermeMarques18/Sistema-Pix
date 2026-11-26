import { api } from '@/app/core/http';
import type { PixKeyType } from '@/app/shared/types/api.types';

export interface PixContact {
  id: string;
  nome: string;
  tipoChave: PixKeyType;
  chavePix: string;
}

export interface PixContactPayload {
  nome: string;
  tipoChave: PixKeyType;
  chavePix: string;
}

export const pixContactsService = {
  async listMine(): Promise<PixContact[]> {
    const { data } = await api.get<PixContact[]>('/api/pix/contacts');
    return data;
  },

  async create(payload: PixContactPayload): Promise<PixContact> {
    const { data } = await api.post<PixContact>('/api/pix/contacts', payload);
    return data;
  },

  async update(id: string, payload: PixContactPayload): Promise<PixContact> {
    const { data } = await api.put<PixContact>(`/api/pix/contacts/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/pix/contacts/${id}`);
  },
};
