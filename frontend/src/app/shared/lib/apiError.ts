import axios from 'axios';
import type { ApiErrorResponse } from '@/app/shared/types/api.types';

/**
 * Extrai a mensagem de erro devolvida pelo backend (ApiErrorResponse.message).
 * Se não houver resposta (servidor fora do ar) ou mensagem, devolve um texto padrão.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação. Tente novamente.',
): string {
  if (axios.isAxiosError<Partial<ApiErrorResponse>>(error)) {
    if (!error.response) return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    if (error.response.status >= 500) return 'Servidor indisponível no momento. Tente novamente em instantes.';
    const message = error.response.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (error.response.status === 401) return 'Sua sessão expirou. Entre novamente.';
    if (error.response.status === 403) return 'Você não tem permissão para realizar esta operação.';
  }
  return fallback;
}
