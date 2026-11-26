import type { PixKeyType, AccountSummary, PixLocationPayload } from '@/app/shared/types/api.types';
export type { PixKeyType, PixTransactionResponse } from '@/app/shared/types/api.types';

export interface SendPixPayload {
  chavePix: string;
  tipoChave: PixKeyType;
  contaDestinoId: string;
  valor: string;
  descricao: string | null;
  password: string;
  idempotencyKey: string;
  location?: PixLocationPayload | null;
}

export interface SendPixFlowData {
  chavePix: string;
  keyType: PixKeyType | null;
  contaDestinoId: string;
  recipientName: string;
  recipientDocument: string | null;
  valor: number;
  descricao: string;
  availableBalance: number;
  blockedBalance: number;
  pixLimit: number;
  accountStatus: AccountSummary['status'];
  scheduledAt?: string;
  location?: PixLocationPayload | null;
  locationCaptureAttempted?: boolean;
  locationCaptureStatus?: 'captured' | 'denied' | 'unavailable';
}

export type SendPixStep = 'inserir-chave' | 'confirmar-conta' | 'inserir-valor' | 'confirmar-valor' | 'confirmar-dados' | 'digitar-senha' | 'sucesso';
