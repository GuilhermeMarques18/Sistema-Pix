import { api } from '@/app/core/http';

export interface CurrentAccount {
  id: string;
  userId: string;
  ownerName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  telefone: string;
  tipoPessoa: 'FISICA' | 'JURIDICA';
  documento: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  telefone?: string;
  notificationType?: 'EMAIL' | 'SMS';
}

export const userService = {
  /** GET /accounts/me — usado para descobrir o id do usuário logado */
  async getMyAccount(): Promise<CurrentAccount> {
    const { data } = await api.get<CurrentAccount>('/accounts/me');
    return data;
  },

  /** GET /api/users/{id} */
  async getUser(userId: string): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>(`/api/users/${userId}`);
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
