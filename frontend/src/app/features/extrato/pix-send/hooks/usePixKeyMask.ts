import { useState, type ChangeEvent } from 'react';
import type { PixKeyType } from '@/app/shared/types/api.types';

/** Detecta o tipo da chave Pix automaticamente conforme o usuário digita */
function detectKeyType(value: string): PixKeyType | null {
  const digits = value.replace(/\D/g, '');
  const clean = value.trim();

  if (!clean) return null;

  // Celular: +55 + 11 dígitos ou (XX) 9XXXX-XXXX
  if (/^(\+55)?\s*\(?\d{2}\)?\s*9\d{4}[-\s]?\d{4}$/.test(clean) || digits.length === 11 && digits[2] === '9') {
    return 'CELULAR';
  }

  // CPF: 11 dígitos
  if (/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(clean) || digits.length === 11) {
    return 'CPF';
  }

  // CNPJ: 14 dígitos
  if (/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(clean) || digits.length === 14) {
    return 'CNPJ';
  }

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return 'EMAIL';
  }

  // Chave aleatória: UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
    return 'ALEATORIO';
  }

  return null;
}

const KEY_TYPE_LABEL: Partial<Record<PixKeyType, string>> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  CELULAR: 'Celular',
  EMAIL: 'E-mail',
  ALEATORIO: 'Chave aleatória',
};

export function usePixKeyMask() {
  const [displayValue, setDisplayValue] = useState('');
  const [keyType, setKeyType] = useState<PixKeyType | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setDisplayValue(value);
    setKeyType(detectKeyType(value));
  }

  return {
    displayValue,
    rawValue: displayValue,
    keyType,
    typeLabel: keyType ? KEY_TYPE_LABEL[keyType] : null,
    handleChange,
  };
}
