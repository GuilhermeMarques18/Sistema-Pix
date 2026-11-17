import type { PixKeyType } from '../types';

/** O backend guarda CPF/CNPJ só com dígitos; aqui formatamos para exibição. */
export function formatPixKey(type: PixKeyType, value: string): string {
  if (type === 'cpf' && /^\d{11}$/.test(value)) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (type === 'cnpj' && /^\d{14}$/.test(value)) {
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}
