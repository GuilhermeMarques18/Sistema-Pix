import { api } from '@/app/core/http';
import type { PixKey, PixKeyStatus, PixKeyType } from '../types';
import { normalizePhoneKey } from '../lib/formatPixKey';
import type { PixKeyResponse as ApiPixKeyResponse, PixKeyType as ApiPixKeyType } from '@/app/shared/types/api.types';

/**
 * RF23 — mude para true quando o backend tiver:
 *  - PATCH /api/pix/keys/{id}/status  body { status: 'ATIVA' | 'SUSPENSA' }
 *  - campo "status" no PixKeyResponse
 */
const KEY_STATUS_MANAGEMENT_AVAILABLE = false;

export class KeyEndpointUnavailableError extends Error {
  constructor(action: string) {
    super(`${action} ainda não está disponível: falta o endpoint no backend.`);
    this.name = 'KeyEndpointUnavailableError';
  }
}

type ApiPixKeyStatus = 'ATIVA' | 'SUSPENSA';

interface PixKeyResponse extends ApiPixKeyResponse {
  status?: ApiPixKeyStatus; // ainda não existe no backend
}

const toApiType: Record<PixKeyType, ApiPixKeyType> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'EMAIL',
  phone: 'CELULAR',
  random: 'ALEATORIO',
};

const fromApiType: Record<ApiPixKeyType, PixKeyType> = {
  CPF: 'cpf',
  CNPJ: 'cnpj',
  EMAIL: 'email',
  CELULAR: 'phone',
  ALEATORIO: 'random',
};

const toApiStatus: Record<PixKeyStatus, ApiPixKeyStatus> = {
  active: 'ATIVA',
  suspended: 'SUSPENSA',
};

function toPixKey(dto: PixKeyResponse): PixKey {
  return {
    id: dto.id,
    type: fromApiType[dto.tipo],
    value: dto.chave,
    status: dto.status === 'SUSPENSA' ? 'suspended' : 'active',
  };
}

export const pixKeysService = {
  /** GET /api/pix/keys/me */
  async listMine(): Promise<PixKey[]> {
    const { data } = await api.get<PixKeyResponse[]>('/api/pix/keys/me');
    return data.map(toPixKey);
  },

  /** POST /api/pix/keys — para chave aleatória o valor não é enviado */
  async create(type: PixKeyType, value?: string): Promise<PixKey> {
    const { data } = await api.post<PixKeyResponse>('/api/pix/keys', {
      tipo: toApiType[type],
      chave: type === 'random' || type === 'cpf' || type === 'cnpj' ? undefined : type === 'phone' && value ? normalizePhoneKey(value) : value?.trim().toLowerCase(),
    });
    return toPixKey(data);
  },

  /** PATCH /api/pix/keys/{id}/status — suspender / desbloquear (RF23) */
  async setStatus(id: string, status: PixKeyStatus): Promise<PixKey> {
    if (!KEY_STATUS_MANAGEMENT_AVAILABLE) {
      throw new KeyEndpointUnavailableError(
        status === 'active' ? 'Desbloquear chave' : 'Suspender chave',
      );
    }

    const { data } = await api.patch<PixKeyResponse>(`/api/pix/keys/${id}/status`, {
      status: toApiStatus[status],
    });

    return toPixKey(data);
  },

  /** PUT /api/pix/keys/{id} — alterar valor ou solicitar regeneração da aleatória (RF24) */
  async update(id: string, type: PixKeyType, value?: string): Promise<PixKey> {
    const payload = type === 'random'
      ? { tipo: toApiType[type] }
      : { tipo: toApiType[type], chave: type === 'phone' && value ? normalizePhoneKey(value) : value?.trim() };
    const { data } = await api.put<PixKeyResponse>(`/api/pix/keys/${id}`, payload);

    return toPixKey(data);
  },
};
