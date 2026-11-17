import axios from 'axios';

/**
 * Extrai a mensagem de erro devolvida pelo backend (ApiErrorResponse.message).
 * Se não houver resposta (servidor fora do ar) ou mensagem, devolve um texto padrão.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação. Tente novamente.',
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Sem conexão com o servidor. Verifique sua internet.';
    const message = error.response.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
