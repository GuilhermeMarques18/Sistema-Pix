import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '@/app/core/auth/token.service';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
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
    const status = error.response?.status;

    switch (status) {
      case 400:
        console.error('[HTTP 400] Dados inválidos ou requisição incorreta.');
        break;
      case 401:
        console.error('[HTTP 401] Não autenticado ou token inválido.');
        tokenService.remove();
        // Redirecionar para login pode ser feito via evento customizado
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        break;
      case 403:
        console.error('[HTTP 403] Sem permissão para acessar este recurso.');
        break;
      case 404:
        console.error('[HTTP 404] Recurso não encontrado.');
        break;
      case 409:
        console.error('[HTTP 409] Conflito ao processar a requisição.');
        break;
      case 422:
        console.error('[HTTP 422] Erro de validação dos dados enviados.');
        break;
      case 500:
        console.error('[HTTP 500] Erro interno do servidor.');
        break;
      default:
        console.error(`[HTTP ${status ?? 'unknown'}] Erro inesperado.`);
    }

    return Promise.reject(error);
  },
);
