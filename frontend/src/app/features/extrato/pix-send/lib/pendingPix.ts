import type { SendPixFlowData } from '../types/pix-send.types';

export interface PendingPix {
  version: 1;
  sourceAccountId: string;
  requestId: string;
  flowData: SendPixFlowData;
}

const storageKey = (accountId: string, scheduled = false) => `sistem_pix:pending-${scheduled ? 'scheduled-' : ''}transfer:${accountId}`;

export function readPendingPix(accountId: string, scheduled = false): PendingPix | null {
  try {
    const value: PendingPix | null = JSON.parse(sessionStorage.getItem(storageKey(accountId, scheduled)) ?? 'null');
    if (!value || value.version !== 1 || value.sourceAccountId !== accountId
      || !/^[0-9a-f-]{36}$/i.test(value.requestId)
      || !['CPF', 'CNPJ', 'EMAIL', 'CELULAR', 'ALEATORIO'].includes(value.flowData?.keyType ?? '')
      || typeof value.flowData.chavePix !== 'string' || typeof value.flowData.contaDestinoId !== 'string'
      || typeof value.flowData.recipientName !== 'string' || typeof value.flowData.descricao !== 'string'
      || !Number.isFinite(value.flowData.valor) || value.flowData.valor <= 0
      || (value.flowData.locationCaptureAttempted !== undefined && typeof value.flowData.locationCaptureAttempted !== 'boolean')
      || (value.flowData.location != null && (
        !Number.isFinite(value.flowData.location.latitude)
        || !Number.isFinite(value.flowData.location.longitude)
        || (value.flowData.location.accuracyMeters != null && !Number.isFinite(value.flowData.location.accuracyMeters))
        || value.flowData.location.source !== 'BROWSER'
      ))
      || (scheduled && (typeof value.flowData.scheduledAt !== 'string' || !Number.isFinite(Date.parse(value.flowData.scheduledAt))))) return null;
    return value;
  } catch { return null; }
}

export function savePendingPix(pending: PendingPix, scheduled = false): boolean {
  try {
    sessionStorage.setItem(storageKey(pending.sourceAccountId, scheduled), JSON.stringify(pending));
    return true;
  } catch { return false; }
}

export function clearPendingPix(accountId: string, scheduled = false) {
  try { sessionStorage.removeItem(storageKey(accountId, scheduled)); } catch { /* O replay no servidor continua idempotente. */ }
}
