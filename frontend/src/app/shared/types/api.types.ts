/** Contratos HTTP do backend. Tipos visuais permanecem nos adaptadores das features. */
export type UserRole = 'USER' | 'ADMIN' | 'OWNER';
export type PersonType = 'FISICA' | 'JURIDICA';
export type NotificationChannel = 'EMAIL' | 'SMS';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  telefone: string;
  tipoPessoa: PersonType;
  documento: string;
  role: UserRole;
  notificationType: NotificationChannel | null;
  createdUser: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  telefone?: string;
  notificationType?: NotificationChannel;
}

export interface AccountSummary {
  id: string;
  userId: string;
  ownerName: string;
  balance: number;
  blockedBalance: number;
  availableBalance: number;
  status: 'BLOQUEADA' | 'DESBLOQUEADA';
  type: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
  transactionLimit: number;
  pixLimit: number;
  createdAccount: string;
}

export type AccountLimits = Pick<AccountSummary, 'transactionLimit' | 'pixLimit'>;
export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'CELULAR' | 'ALEATORIO';
export type PixKeyStatus = 'ATIVA' | 'SUSPENSA';

export interface PixKeyResponse {
  id: string;
  contaBancariaId: string;
  tipo: PixKeyType;
  chave: string;
  criadoEm: string;
  status: PixKeyStatus;
}

export interface PixKeyValidationResponse {
  valida: boolean;
  cadastrada: boolean;
  tipo: PixKeyType;
  chave: string;
  contaDestinoId: string | null;
  status: PixKeyStatus | null;
}

export interface PixTransactionResponse {
  idTransacao: string;
  contaOrigemId: string;
  contaDestinoId: string;
  descricao: string | null;
  valor: number;
  dataHora: string;
  chavePix: string | null;
  tipoChave: PixKeyType | null;
  nomeDestinatario: string | null;
  documentoDestinatarioMascarado: string | null;
}

export interface PixRecipientResponse {
  tipo: PixKeyType;
  chave: string;
  contaDestinoId: string;
  nome: string;
  documentoMascarado: string | null;
}

export interface PixExtractItemResponse {
  idTransacao: string;
  dataHora: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  descricao: string | null;
  contaContraparteId: string;
}

export interface PixExtractResponse {
  periodoInicio: string;
  periodoFim: string;
  totalEntradas: number;
  totalSaidas: number;
  transacoes: PixExtractItemResponse[];
}

export type DisputeStatus = 'ABERTA' | 'CONTESTADA' | 'APROVADA' | 'RECUSADA' | 'CANCELADA';

export interface DisputeResponse {
  idDisputa: string;
  idTransacao: string;
  contaSolicitanteId: string;
  contaDestinoId: string;
  valor: number;
  motivoAbertura: string;
  justificativaRecebedor: string | null;
  justificativaAdmin: string | null;
  status: DisputeStatus;
  resolvidoPor: 'ADMIN' | 'OWNER' | 'RECEBEDOR' | 'EMISSOR' | null;
  resolvidoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
