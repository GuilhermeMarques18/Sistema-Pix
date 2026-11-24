import { z } from 'zod';
import type { PixKeyType } from '../types';
import { normalizePhoneKey } from '../lib/formatPixKey';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

// Mesmos formatos aceitos pelo backend (PixKeyService)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,13}$/;

const valueSchemaByType: Record<PixKeyType, z.ZodTypeAny> = {
  cpf: z
    .string({ required_error: 'CPF obrigatório.' })
    .refine((v) => onlyDigits(v).length === 11, 'Informe um CPF válido com 11 dígitos.'),
  cnpj: z
    .string({ required_error: 'CNPJ obrigatório.' })
    .refine((v) => onlyDigits(v).length === 14, 'Informe um CNPJ válido com 14 dígitos.'),
  email: z
    .string({ required_error: 'E-mail obrigatório.' })
    .regex(emailRegex, 'Informe um e-mail válido.'),
  phone: z
    .string({ required_error: 'Telefone obrigatório.' })
    .refine((value) => phoneRegex.test(normalizePhoneKey(value)), 'Informe um telefone com DDD válido.'),
  // Chave aleatória é gerada pelo backend: não há valor para validar
  random: z.string().optional(),
};

export function registerKeySchema(type: PixKeyType) {
  return z.object({ value: valueSchemaByType[type] });
}

export type RegisterKeyFormData = { value: string };
