import { api } from '@/app/core/http';
import type {
  PixKeyValidationResponse,
  AccountInfo,
  PixTransactionResponse,
  SendPixPayload,
} from '../types/pix-send.types';

export const pixSendService = {
  /**
   * Valida a chave Pix chamando o backend.
   * GET /api/pix/keys/validate?tipo=X&chave=Y
   * O tipo é detectado localmente a partir do formato da chave.
   */
  async validateKey(chave: string): Promise<PixKeyValidationResponse> {
    const tipo = detectKeyType(chave);
    const { data } = await api.get<PixKeyValidationResponse>('/api/pix/keys/validate', {
      params: { tipo, chave },
    });
    return data;
  },

  /**
   * Busca dados da conta de destino pelo ID.
   * GET /accounts/{id}
   */
  async getAccountById(id: string): Promise<AccountInfo> {
    const { data } = await api.get<AccountInfo>(`/accounts/${id}`);
    return data;
  },

  /**
   * Realiza a transferência Pix.
   * POST /api/pix/transactions
   */
  async sendPix(payload: SendPixPayload): Promise<PixTransactionResponse> {
    const { data } = await api.post<PixTransactionResponse>('/api/pix/transactions', {
      chavePix: payload.chavePix,
      valor: payload.valor,
      descricao: payload.descricao ?? null,
    });
    return data;
  },
};

/**
 * Detecta o tipo da chave Pix pelo formato.
 *
 * Aceita chaves nos formatos:
 *  - CPF:       "12345678901" ou "123.456.789-01"
 *  - CNPJ:      "12345678000195" ou "12.345.678/0001-95"
 *  - CELULAR:   "+5511987654321" ou "11987654321" ou "(11) 98765-4321"
 *  - EMAIL:     qualquer string com @ e domínio
 *  - ALEATORIO: UUID ou chave aleatória (fallback)
 */
export function detectKeyType(chave: string): string {
  const raw = chave.trim();

  // Remove toda formatação para contar dígitos
  const digits = raw.replace(/\D/g, '');

  // E-mail — contém @ e pelo menos um ponto após o @
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return 'EMAIL';

  // CPF: 11 dígitos (com ou sem formatação 000.000.000-00)
  if (digits.length === 11 && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(raw.replace(/\s/g, ''))) {
    return 'CPF';
  }

  // CNPJ: 14 dígitos (com ou sem formatação 00.000.000/0000-00)
  if (digits.length === 14) return 'CNPJ';

  // Celular brasileiro
  // Formatos aceitos: +5511987654321, 5511987654321, 11987654321, (11)987654321, (11) 9 8765-4321
  if (isCelular(digits)) return 'CELULAR';

  // UUID / chave aleatória
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
    return 'ALEATORIO';
  }

  // Fallback — deixa o backend decidir
  return 'ALEATORIO';
}

function isCelular(digits: string): boolean {
  // Com código do país +55: 13 dígitos (55 + DDD 2 + 9 + número 8)
  if (digits.length === 13 && digits.startsWith('55')) {
    const sem55 = digits.slice(2);
    return sem55[0] !== '0' && sem55[2] === '9';
  }
  // Sem código do país: 11 dígitos (DDD 2 + 9 + número 8)
  if (digits.length === 11) {
    return digits[2] === '9';
  }
  return false;
}
