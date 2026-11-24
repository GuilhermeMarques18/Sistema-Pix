import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '@/app/core/auth/token.service';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.trim() || '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — injeta o JWT em todas as requisições ───────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor — tratamento centralizado de erros HTTP ─────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const isLogin = /\/api\/auth\/login\/?(?:\?|$)/.test(error.config?.url ?? '');
    const currentToken = tokenService.get();
    const requestToken = error.config?.headers?.Authorization;

    // Uma resposta de outra sessão ou uma senha de login errada não encerra a sessão atual.
    if (error.response?.status === 401 && !isLogin && currentToken && requestToken === `Bearer ${currentToken}`) {
      tokenService.remove();
    }

    return Promise.reject(error);
  },
);
