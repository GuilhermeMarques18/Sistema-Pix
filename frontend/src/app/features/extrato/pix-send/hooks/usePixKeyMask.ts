import { useState, type ChangeEvent } from 'react';
import type { PixKeyType } from '@/app/shared/types/api.types';

/** O tipo é escolhido pelo usuário. O texto não é truncado nem transformado durante a digitação. */
export function usePixKeyMask() {
  const [displayValue, setDisplayValue] = useState('');
  const [keyType, setKeyType] = useState<PixKeyType>('EMAIL');
  return {
    displayValue,
    rawValue: displayValue,
    keyType,
    setKeyType,
    handleChange: (event: ChangeEvent<HTMLInputElement>) => setDisplayValue(event.target.value),
  };
}
