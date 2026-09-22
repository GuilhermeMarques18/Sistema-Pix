import { z } from 'zod';
import type { PixKeyType } from '../types';

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

const valueSchemaByType: Record<PixKeyType, z.ZodTypeAny> = {
  cpf: z
    .string({ required_error: 'CPF obrigatório.' })
    .regex(cpfRegex, 'Informe um CPF válido (000.000.000-00).'),
  email: z
    .string({ required_error: 'E-mail obrigatório.' })
    .email('Informe um e-mail válido.'),
  phone: z
    .string({ required_error: 'Telefone obrigatório.' })
    .regex(phoneRegex, 'Informe um telefone válido.'),
  random: z.string().optional(),
};

export function registerKeySchema(type: PixKeyType) {
  return z.object({ value: valueSchemaByType[type] });
}

export type RegisterKeyFormData = { value: string };