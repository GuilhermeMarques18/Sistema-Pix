import { api } from '@/app/core/http';
import { tokenService } from '@/app/core/auth';
import type { LoginFormData } from '../schemas/login.schema';

interface LoginResponse {
  token: string;
}

export const authService = {
  async login(credentials: LoginFormData): Promise<void> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    tokenService.set(data.token);
  },

  logout(): void {
    tokenService.remove();
  },

  isAuthenticated(): boolean {
    return tokenService.exists();
  },
};
