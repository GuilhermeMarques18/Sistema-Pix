export interface PixTransactionResponse {
  idTransacao: string;
  contaOrigemId: string;
  contaDestinoId: string;
  descricao: string | null;
  valor: number;
  dataHora: string; // ISO 8601
}

export interface AccountSummary {
  id: string;
  userId: string;
  ownerName: string;
  balance: number;
  status: string;
  type: string;
  transactionLimit: number;
  pixLimit: number;
  createdAccount: string;
}

export type PeriodFilter = '7' | '30' | '90' | 'all';

export interface PeriodOption {
  label: string;
  value: PeriodFilter;
}
