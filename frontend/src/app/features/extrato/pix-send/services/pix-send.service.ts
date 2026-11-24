import { api } from '@/app/core/http';
import { normalizePixKey } from '@/app/shared/lib/pixKey';
import type { PixKeyType, PixRecipientResponse, PixTransactionResponse } from '@/app/shared/types/api.types';
import type { SendPixPayload } from '../types/pix-send.types';

export const pixSendService = {
  async resolveRecipient(tipo: PixKeyType, chave: string): Promise<PixRecipientResponse> {
    const { data } = await api.get<PixRecipientResponse>('/api/pix/recipients/resolve', {
      params: { tipo, chave: normalizePixKey(tipo, chave) },
    });
    return data;
  },
  async sendPix(payload: SendPixPayload): Promise<PixTransactionResponse> {
    const { data } = await api.post<PixTransactionResponse>('/api/pix/transactions', {
      chavePix: payload.chavePix,
      tipoChave: payload.tipoChave,
      contaDestinoId: payload.contaDestinoId,
      valor: payload.valor,
      descricao: payload.descricao,
      password: payload.password,
      idempotencyKey: payload.idempotencyKey,
    });
    return data;
  },
  async schedulePix(payload: SendPixPayload & { scheduledAt: string }): Promise<unknown> {
    const { data } = await api.post('/api/pix/scheduled-transactions', payload);
    return data;
  },
  async getReceipt(id: string): Promise<PixTransactionResponse> {
    const { data } = await api.get<PixTransactionResponse>(`/api/pix/transactions/${id}`);
    return data;
  },
};
