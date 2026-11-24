import type { SendPixFlowData } from '../types/pix-send.types';

export interface PendingPix {
  version: 1;
  sourceAccountId: string;
  requestId: string;
  flowData: SendPixFlowData;
}

const storageKey = (accountId: string) => `sistem_pix:pending-transfer:${accountId}`;

export function readPendingPix(accountId: string): PendingPix | null {
  try {
    const value: PendingPix | null = JSON.parse(sessionStorage.getItem(storageKey(accountId)) ?? 'null');
    if (!value || value.version !== 1 || value.sourceAccountId !== accountId
      || !/^[0-9a-f-]{36}$/i.test(value.requestId)
      || !['CPF', 'CNPJ', 'EMAIL', 'CELULAR', 'ALEATORIO'].includes(value.flowData?.keyType ?? '')
      || typeof value.flowData.chavePix !== 'string' || typeof value.flowData.contaDestinoId !== 'string'
      || typeof value.flowData.recipientName !== 'string' || typeof value.flowData.descricao !== 'string'
      || !Number.isFinite(value.flowData.valor) || value.flowData.valor <= 0) return null;
    return value;
  } catch { return null; }
}

export function savePendingPix(pending: PendingPix): boolean {
  try {
    sessionStorage.setItem(storageKey(pending.sourceAccountId), JSON.stringify(pending));
    return true;
  } catch { return false; }
}

export function clearPendingPix(accountId: string) {
  try { sessionStorage.removeItem(storageKey(accountId)); } catch { /* O replay no servidor continua idempotente. */ }
}
