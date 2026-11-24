import type { PixKeyType } from '../types';

export { normalizePhoneKey } from '@/app/shared/lib/pixKey';

export function formatPhoneInput(value: string): string {
  if (value.trim().startsWith('+') && !value.trim().startsWith('+55')) return value;
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const hasCountryCode = digits.startsWith('55') && (value.trim().startsWith('+') || digits.length > 11);
  const national = (hasCountryCode ? digits.slice(2) : digits).slice(0, 11);
  const prefix = hasCountryCode ? '+55 ' : '';
  if (!national) return prefix;
  if (national.length <= 2) return `${prefix}(${national}`;

  const ddd = national.slice(0, 2);
  const number = national.slice(2);
  const split = number.length > 8 ? 5 : 4;
  return `${prefix}(${ddd}) ${number.slice(0, split)}${number.length > split ? `-${number.slice(split)}` : ''}`;
}

/** O backend guarda CPF/CNPJ só com dígitos; aqui formatamos para exibição. */
export function formatPixKey(type: PixKeyType, value: string): string {
  if (type === 'cpf' && /^\d{11}$/.test(value)) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (type === 'cnpj' && /^\d{14}$/.test(value)) {
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  if (type === 'phone' && /^\+?\d{10,13}$/.test(value)) {
    return formatPhoneInput(value);
  }
  return value;
}
