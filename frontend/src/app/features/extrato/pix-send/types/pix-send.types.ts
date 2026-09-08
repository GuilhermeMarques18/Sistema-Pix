export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'CELULAR' | 'ALEATORIO';

export interface PixKeyValidationResponse {
  valida: boolean;
  cadastrada: boolean;
  tipo: PixKeyType;
  chave: string;
  contaDestinoId: string;
}

export interface AccountInfo {
  id: string;
  ownerName: string;
  pixLimit: number;
  balance: number;
}

export interface SendPixPayload {
  chavePix: string;
  valor: number;
  descricao?: string;
}

export interface PixTransactionResponse {
  idTransacao: string;
  contaOrigemId: string;
  contaDestinoId: string;
  descricao: string | null;
  valor: number;
  dataHora: string;
}

// Estado acumulado ao longo do fluxo
export interface SendPixFlowData {
  chavePix: string;
  keyType: PixKeyType | null;
  contaDestinoId: string;
  recipientName: string;
  recipientAccount: string;
  recipientCpf: string;
  recipientAgencia: string;
  valor: number;
  descricao: string;
  availableBalance: number;
  pixLimit: number;
}

export type SendPixStep =
  | 'inserir-chave'
  | 'confirmar-conta'
  | 'inserir-valor'
  | 'confirmar-valor'
  | 'confirmar-dados'
  | 'digitar-senha'
  | 'sucesso';
