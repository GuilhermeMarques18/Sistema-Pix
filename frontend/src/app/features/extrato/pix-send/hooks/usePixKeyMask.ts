'use client';

import { useState, useCallback } from 'react';

export type DetectedKeyType =
  | 'cpf'
  | 'cnpj'
  | 'celular'
  | 'email'
  | 'aleatorio'
  | 'unknown';

interface UsePixKeyMaskReturn {
  /** Valor exibido no input (com máscara aplicada) */
  displayValue: string;
  /** Valor bruto para enviar ao backend (sem máscara para CPF/CNPJ/celular) */
  rawValue: string;
  /** Tipo detectado em tempo real */
  keyType: DetectedKeyType;
  /** Handler para o onChange do input */
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Limpa o campo */
  clear: () => void;
}

export function usePixKeyMask(): UsePixKeyMaskReturn {
  const [displayValue, setDisplayValue] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [keyType, setKeyType] = useState<DetectedKeyType>('unknown');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Se já tem @ é e-mail — sem máscara
    if (input.includes('@')) {
      setDisplayValue(input);
      setRawValue(input);
      setKeyType('email');
      return;
    }

    // Se começa com letra (exceto dígito) e não é dígito puro → chave aleatória
    // Permite UUID (letras + hífens) ou qualquer string não numérica
    const isAllowedAleatoria =
      input.length > 0 &&
      !/^\d/.test(input) &&
      !input.includes('@');

    if (isAllowedAleatoria) {
      setDisplayValue(input);
      setRawValue(input);
      setKeyType('aleatorio');
      return;
    }

    // A partir daqui só dígitos — extrai apenas números
    const digits = input.replace(/\D/g, '');

    // Limita a 14 dígitos (CNPJ é o maior)
    const capped = digits.slice(0, 14);

    const { masked, type } = applyNumericMask(capped);

    setDisplayValue(masked);
    // Sempre envia dígitos puros para CPF, CNPJ e celular
    // Para email e aleatório mantém o valor original
    setRawValue(capped);
    setKeyType(type);
  }, []);

  const clear = useCallback(() => {
    setDisplayValue('');
    setRawValue('');
    setKeyType('unknown');
  }, []);

  return { displayValue, rawValue, keyType, handleChange, clear };
}

// ─── Máscara numérica dinâmica ────────────────────────────────────────────────

interface MaskResult {
  masked: string;
  type: DetectedKeyType;
}

function applyNumericMask(digits: string): MaskResult {
  const len = digits.length;

  // ── Celular: até 11 dígitos, 3º dígito é 9 (após DDD de 2 dígitos)
  // Formato: (00) 00000-0000
  // Durante digitação mostra a máscara progressivamente
  if (len <= 11 && (len < 3 || digits[2] === '9')) {
    return { masked: maskCelular(digits), type: len <= 11 ? 'celular' : 'unknown' };
  }

  // ── CPF: até 11 dígitos e não encaixou em celular
  if (len <= 11) {
    return { masked: maskCPF(digits), type: 'cpf' };
  }

  // ── CNPJ: 12–14 dígitos
  if (len <= 14) {
    return { masked: maskCNPJ(digits), type: 'cnpj' };
  }

  return { masked: digits, type: 'unknown' };
}

// (00) 00000-0000  — progressiva
function maskCelular(d: string): string {
  let result = d;
  if (d.length > 2) result = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) result = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  else if (d.length > 2) result = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return result;
}

// 000.000.000-00  — progressiva
function maskCPF(d: string): string {
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

// 00.000.000/0000-00  — progressiva
function maskCNPJ(d: string): string {
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}
