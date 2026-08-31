import { User, Mail, Phone, Shuffle, type LucideIcon } from 'lucide-react';
import type { PixKeyType } from '../types';

/**
 * Metadados de cada tipo de chave PIX:
 * - label: nome exibido na interface
 * - description: texto auxiliar 
 * - icon: ícone do lucide-react correspondente ao tipo
 */
export const pixKeyMeta: Record<PixKeyType, { label: string; description: string; icon: LucideIcon }> = {
  cpf: {
    label: 'CPF',
    description: 'Utilize seu CPF como chave',
    icon: User,
  },
  email: {
    label: 'E-mail',
    description: 'Utilize seu e-mail como chave',
    icon: Mail,
  },
  phone: {
    label: 'Telefone',
    description: 'Utilize seu telefone como chave',
    icon: Phone,
  },
  random: {
    label: 'Chave Aleatória',
    description: 'Gere uma chave aleatória',
    icon: Shuffle,
  },
};