import { UserIcon, EnvelopeIcon, PhoneIcon, ShuffleIcon, type Icon } from '@phosphor-icons/react';
import type { PixKeyType } from '../types';

/**
 * Metadados de cada tipo de chave PIX:
 * - label: nome exibido na interface
 * - description: texto auxiliar
 * - icon: ícone do @phosphor-icons/react correspondente ao tipo
 */
export const pixKeyMeta: Record<PixKeyType, { label: string; description: string; icon: Icon }> = {
  cpf: {
    label: 'CPF',
    description: 'Utilize seu CPF como chave',
    icon: UserIcon,
  },
  email: {
    label: 'E-mail',
    description: 'Utilize seu e-mail como chave',
    icon: EnvelopeIcon,
  },
  phone: {
    label: 'Telefone',
    description: 'Utilize seu telefone como chave',
    icon: PhoneIcon,
  },
  random: {
    label: 'Chave Aleatória',
    description: 'Gere uma chave aleatória',
    icon: ShuffleIcon,
  },
};