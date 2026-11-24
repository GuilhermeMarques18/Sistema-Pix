export type { AccountSummary, PixTransactionResponse } from '@/app/shared/types/api.types';

export type PeriodFilter = '7' | '30' | '90' | 'all';

export interface PeriodOption {
  label: string;
  value: PeriodFilter;
}
