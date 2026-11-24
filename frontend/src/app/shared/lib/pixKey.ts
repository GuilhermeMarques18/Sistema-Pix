import type { PixKeyType } from '@/app/shared/types/api.types';

export const pixKeyLabels: Record<PixKeyType, string> = {
  CPF: 'CPF', CNPJ: 'CNPJ', EMAIL: 'E-mail', CELULAR: 'Celular', ALEATORIO: 'Chave aleatória',
};

export function normalizePhoneKey(value: string): string {
  const phone = value.trim().replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{10,13}$/.test(phone)) return phone;
  return phone.startsWith('+') ? phone : '+' + (phone.length <= 11 ? '55' : '') + phone;
}

export function normalizePixKey(type: PixKeyType, value: string): string {
  const raw = value.trim();
  let result = raw;
  if (type === 'CPF' || type === 'CNPJ') {
    result = raw.replace(/[.\/\s-]/g, '');
    if (!(type === 'CPF' ? /^\d{11}$/ : /^\d{14}$/).test(result)) throw new Error(`${type} inválido.`);
  } else if (type === 'CELULAR') {
    result = normalizePhoneKey(raw);
    if (!/^\+[0-9]{10,13}$/.test(result)) throw new Error('Informe um telefone válido com DDD.');
  } else if (type === 'EMAIL') {
    result = raw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error('Informe um e-mail válido.');
  } else {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) throw new Error('Chave aleatória deve ser um UUID válido.');
    result = raw.toLowerCase();
  }
  if (result.length > 77) throw new Error('Chave Pix deve ter no máximo 77 caracteres.');
  return result;
}
